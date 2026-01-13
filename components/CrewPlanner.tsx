import React, { useState, useMemo, useCallback } from 'react';
import type { Turnaround, PlannerShift } from '../types';
import { RobotIcon, SpinnerIcon, CheckIcon } from './icons/ActionIcons';
import { PlannerIcon } from './icons/PlannerIcon';
import { isWideBody } from '../utils/helpers';

interface CrewPlannerProps {
    turnarounds: Turnaround[];
    onApplyPlan?: (shifts: PlannerShift[], date: string) => void;
}

type DemandData = {
    timeSlot: number; // minutes from midnight
    requiredTeams: number;
};

type PlanResult = {
    totalTeams: number;
    shifts: PlannerShift[];
    demandProfile: DemandData[];
    capacityProfile: number[];
    utilization: number;
};

const TIME_SLOT_MINUTES = 15;
const SLOTS_PER_DAY = (24 * 60) / TIME_SLOT_MINUTES;

export const CrewPlanner: React.FC<CrewPlannerProps> = ({ turnarounds, onApplyPlan }) => {
    const [isCalculating, setIsCalculating] = useState(false);
    const [plan, setPlan] = useState<PlanResult | null>(null);
    
    // Date Selection Logic
    const getDateKey = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [planningDateKey, setPlanningDateKey] = useState<string>(() => getDateKey(new Date()));

    const dateTabs = useMemo(() => {
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        
        return [
            { key: getDateKey(today), label: 'Today', fullDate: today.toLocaleDateString() },
            { key: getDateKey(tomorrow), label: 'Tomorrow', fullDate: tomorrow.toLocaleDateString() },
        ];
    }, []);

    const calculateDemandProfile = useCallback((): DemandData[] => {
        const demandSlots = Array(SLOTS_PER_DAY).fill(0);

        turnarounds.forEach(turnaround => {
            const isWB = isWideBody(turnaround.aircraftType);

            const processLeg = (timeStr: string | undefined, isDeparture: boolean) => {
                if (!timeStr) return;

                const refTime = new Date(timeStr);
                if (isNaN(refTime.getTime())) return;
                
                // STRICT DATE FILTER: Only count demand if it actually occurs on the planning date
                const legDateKey = getDateKey(refTime);
                
                // Specific durations: NB Arr 15, NB Dep 35, WB Arr 25, WB Dep 70
                let durationMinutes = 0;
                if (isDeparture) {
                    durationMinutes = isWB ? 70 : 35;
                } else {
                    durationMinutes = isWB ? 25 : 15;
                }
                
                const serviceDuration = durationMinutes * 60 * 1000;
                
                let startTime, endTime;
                if (isDeparture) {
                    // For departure, service ends at STD
                    endTime = refTime.getTime();
                    startTime = endTime - serviceDuration;
                } else {
                    // For arrival, service starts at STA
                    startTime = refTime.getTime();
                    endTime = startTime + serviceDuration;
                }

                // Handle boundary crossing (e.g. flight starts 23:50 today, ends 00:30 tomorrow)
                // We only care about the portion of the task falling within the 00:00-23:59 of selected day
                const selectedDateStart = new Date(planningDateKey);
                selectedDateStart.setHours(0,0,0,0);
                const selectedDateEnd = new Date(planningDateKey);
                selectedDateEnd.setHours(23,59,59,999);

                // If task ends before today starts OR starts after today ends, skip
                if (endTime < selectedDateStart.getTime() || startTime > selectedDateEnd.getTime()) return;

                // Clamp to selected day boundaries for the chart
                const clampedStart = Math.max(startTime, selectedDateStart.getTime());
                const clampedEnd = Math.min(endTime, selectedDateEnd.getTime());

                const startSlot = Math.floor((new Date(clampedStart).getHours() * 60 + new Date(clampedStart).getMinutes()) / TIME_SLOT_MINUTES);
                const endSlot = Math.ceil((new Date(clampedEnd).getHours() * 60 + new Date(clampedEnd).getMinutes()) / TIME_SLOT_MINUTES);

                for (let i = startSlot; i < endSlot; i++) {
                    if (i >= 0 && i < SLOTS_PER_DAY) {
                        demandSlots[i] += 1; 
                    }
                }
            };
            
            processLeg(turnaround.arrival.sta, false);
            processLeg(turnaround.departure.std, true);
        });

        return demandSlots.map((count, i) => ({
            timeSlot: i * TIME_SLOT_MINUTES,
            requiredTeams: count
        }));
    }, [turnarounds, planningDateKey]);

    const handleCalculatePlan = useCallback(() => {
        setIsCalculating(true);
        setTimeout(() => {
            const demandProfile = calculateDemandProfile();
            const requiredTeamsPerSlot = demandProfile.map(d => d.requiredTeams);
            const totalDemandVolume = requiredTeamsPerSlot.reduce((a, b) => a + b, 0);
            
            // CONFIGURATION: 8.5 Hour shifts
            const SHIFT_DURATION_HOURS = 8.5; 
            const SHIFT_DURATION_SLOTS = (SHIFT_DURATION_HOURS * 60) / TIME_SLOT_MINUTES;
            
            // STRICT REQUIREMENT: Start times 04:00 to 17:00 in 30 min intervals
            const possibleShiftStartHours: number[] = [];
            for (let h = 4; h <= 17; h += 0.5) {
                possibleShiftStartHours.push(h);
            }

            let capacity = Array(SLOTS_PER_DAY).fill(0);
            let assignedShifts: PlannerShift[] = [];

            // "Peak-Smashing" Algorithm with greedy selection
            let unmetDemand = [...requiredTeamsPerSlot];
            let maxUnmet = Math.max(...unmetDemand);

            // While we still have flights not covered by crews
            while (maxUnmet > 0) {
                let bestShiftStartHour = -1;
                let bestScore = -1;

                // Look for the shift time that covers the most "unmet" slots
                possibleShiftStartHours.forEach(startHour => {
                    const startSlot = (startHour * 60) / TIME_SLOT_MINUTES;
                    const endSlot = startSlot + SHIFT_DURATION_SLOTS;
                    
                    let score = 0;
                    for (let i = startSlot; i < endSlot; i++) {
                        const slotIndex = i % SLOTS_PER_DAY; // Handle wrap around if needed, though strictly we cut off late night
                        if (unmetDemand[slotIndex] > 0) {
                            // Simple greedy: 1 point for every slot covered that needs coverage
                            score += 1; 
                            // Bonus: Prioritize peaks slightly to ensure we don't leave single peaks stranded
                            if (unmetDemand[slotIndex] === maxUnmet) score += 0.5;
                        }
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestShiftStartHour = startHour;
                    }
                });

                if (bestShiftStartHour !== -1 && bestScore > 0) {
                    // Add this shift
                    const startSlot = (bestShiftStartHour * 60) / TIME_SLOT_MINUTES;
                    const endSlot = startSlot + SHIFT_DURATION_SLOTS;
                    
                    for (let i = startSlot; i < endSlot; i++) {
                        const slotIndex = i % SLOTS_PER_DAY;
                        capacity[slotIndex]++;
                        if (unmetDemand[slotIndex] > 0) unmetDemand[slotIndex]--;
                    }
                    
                    const existingShift = assignedShifts.find(s => s.startHour === bestShiftStartHour);
                    if (existingShift) {
                        existingShift.teamCount++;
                    } else {
                        assignedShifts.push({
                            startHour: bestShiftStartHour,
                            endHour: (bestShiftStartHour + SHIFT_DURATION_HOURS) % 24,
                            teamCount: 1,
                        });
                    }
                    
                    maxUnmet = Math.max(...unmetDemand);
                } else {
                    // Cannot cover remaining demand with allowed shift times (e.g., late night flights)
                    break; 
                }
            }

            assignedShifts.sort((a,b) => a.startHour - b.startHour);
            const totalTeams = assignedShifts.reduce((sum, s) => sum + s.teamCount, 0);
            const totalCapacityVolume = capacity.reduce((a, b) => a + b, 0);
            
            // Calculate utilization
            let usefulWork = 0;
            for(let i=0; i<SLOTS_PER_DAY; i++) {
                usefulWork += Math.min(capacity[i], requiredTeamsPerSlot[i]);
            }
            const utilization = totalCapacityVolume > 0 ? Math.round((usefulWork / totalCapacityVolume) * 100) : 0;

            setPlan({
                totalTeams,
                shifts: assignedShifts,
                demandProfile,
                capacityProfile: capacity,
                utilization
            });
            setIsCalculating(false);

        }, 600);
    }, [calculateDemandProfile]);

    const maxDemand = useMemo(() => {
        if (!plan) return 1;
        return Math.max(...plan.demandProfile.map(d => d.requiredTeams), ...plan.capacityProfile) || 1;
    }, [plan]);

    const formatTime = (minutes: number) => {
        const h = Math.floor((minutes / 60) % 24);
        const m = Math.round(minutes % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Resource Planner</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Calculate supply sheet for {dateTabs.find(d => d.key === planningDateKey)?.fullDate} (04:00 - 17:00 Starts).
                    </p>
                </div>
                
                {/* Date Slider */}
                <div className="flex bg-slate-200 rounded-lg p-1">
                    {dateTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setPlanningDateKey(tab.key); setPlan(null); }}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                                planningDateKey === tab.key
                                    ? 'bg-white text-[#00624D] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button
                  onClick={handleCalculatePlan}
                  disabled={isCalculating}
                  className="flex-shrink-0 flex items-center justify-center gap-2 px-4 h-9 text-xs font-semibold text-white bg-[#00624D] rounded-lg shadow-md hover:bg-[#004f3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isCalculating ? (
                    <SpinnerIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <RobotIcon className="h-5 w-5" />
                  )}
                  <span>{isCalculating ? 'Calculating...' : 'Generate Supply Sheet'}</span>
                </button>
            </div>
            
            {!plan && !isCalculating && (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                    <div className="text-slate-400">
                        <PlannerIcon className="h-12 w-12 mx-auto" />
                        <p className="mt-4 font-semibold text-sm">Ready to plan resources for {dateTabs.find(d => d.key === planningDateKey)?.label}</p>
                        <p className="text-xs">Click the button above to calculate optimal crew supply.</p>
                    </div>
                </div>
            )}
            
            {isCalculating && (
                 <div className="text-center py-16">
                    <SpinnerIcon className="h-10 w-10 mx-auto animate-spin text-[#00624D]" />
                    <p className="mt-4 font-semibold text-sm text-slate-600">Analyzing schedule and generating supply sheet...</p>
                 </div>
            )}

            {plan && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Results Summary */}
                    <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="font-bold text-sm text-slate-700">Supply Sheet (Roster)</h3>
                         <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Total Crews</p>
                                <p className="text-3xl font-bold text-[#00624D]">{plan.totalTeams}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Efficiency</p>
                                <p className="text-3xl font-bold text-teal-600">{plan.utilization}%</p>
                            </div>
                         </div>
                         <h4 className="font-semibold text-slate-600 text-xs mt-6 mb-2">Shift Breakdown (8.5h):</h4>
                         <ul className="space-y-1 text-xs max-h-60 overflow-y-auto">
                            {plan.shifts.map((shift, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md border border-slate-100">
                                    <span className="font-mono text-slate-500">{formatTime(shift.startHour * 60)} - {formatTime(shift.endHour * 60)}</span>
                                    <span className="font-bold text-slate-700">{shift.teamCount} {shift.teamCount > 1 ? 'Crews' : 'Crew'}</span>
                                </li>
                            ))}
                         </ul>
                         
                         {onApplyPlan && (
                             <button
                                onClick={() => onApplyPlan(plan.shifts, planningDateKey)}
                                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00624D] hover:bg-[#004f3d] text-white rounded-lg shadow-md transition-colors text-xs font-bold"
                             >
                                <CheckIcon className="h-4 w-4" />
                                Create Teams & Go to Schedule
                             </button>
                         )}
                         <p className="text-[10px] text-slate-400 mt-2 text-center">
                            This will create empty teams for these timeslots. Use Auto-Assign to distribute flights fairly.
                         </p>
                    </div>
                    {/* Chart */}
                    <div className="lg:col-span-2">
                         <h3 className="font-bold text-sm text-slate-700 mb-2">Demand vs. Supply</h3>
                        <div className="w-full h-80 bg-white p-4 border border-slate-200 rounded-lg relative">
                            <div className="w-full h-full flex items-end gap-[0.2%]">
                                {plan.demandProfile.map((data, index) => (
                                    <div key={index} className="flex-1 h-full relative group">
                                        {/* Tooltip */}
                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] p-1 rounded whitespace-nowrap z-10">
                                            {formatTime(data.timeSlot)}: Need {data.requiredTeams} / Have {plan.capacityProfile[index]}
                                        </div>
                                        
                                        {/* Capacity Bar (Light) */}
                                        <div
                                            className="absolute bottom-0 w-full bg-teal-100 transition-all duration-500"
                                            style={{ height: `${(plan.capacityProfile[index] / maxDemand) * 100}%` }}
                                        />
                                        {/* Demand Bar (Dark) */}
                                        <div
                                            className="absolute bottom-0 w-full bg-[#00624D] transition-all duration-500 opacity-90"
                                            style={{ height: `${(data.requiredTeams / maxDemand) * 100}%` }}
                                        />
                                        {/* Overcapacity Indicator (Red tip if capacity < demand) */}
                                        {plan.capacityProfile[index] < data.requiredTeams && (
                                            <div 
                                                className="absolute w-full bg-red-500 top-0 h-1"
                                                style={{ bottom: `${(data.requiredTeams / maxDemand) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Y-Axis Labels */}
                             <div className="absolute top-0 left-0 h-full -translate-x-full text-[10px] text-slate-400 pr-2 flex flex-col justify-between">
                                 <span>{maxDemand}</span>
                                 <span>0</span>
                             </div>
                             {/* X-Axis Labels */}
                             <div className="w-full flex justify-between mt-1 text-[10px] text-slate-400">
                                 {Array.from({length: 7}).map((_, i) => (
                                     <span key={i} className="flex-1 text-center">{formatTime(i * 4 * 60)}</span>
                                 ))}
                             </div>
                             {/* Legend */}
                             <div className="absolute top-2 right-4 flex items-center gap-4 text-[10px]">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#00624D]/90"></div><span>Flights (Demand)</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-teal-100"></div><span>Crews (Supply)</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};