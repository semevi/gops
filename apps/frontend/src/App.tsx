import React, { useState, useCallback, useEffect } from 'react';
import { FlightScheduleTable } from './components/FlightScheduleTable';
import { MOCK_TEAMS } from './constants';
import { FlightStatus, Skill } from './types';
import type { Turnaround, Team, Flight, CrewMember, CustomRoster, PlannerShift } from './types';
import { PlaneTakeoffIcon } from './components/icons/PlaneIcon';
import { RobotIcon, SpinnerIcon, UsersIcon, DownloadIcon } from './components/icons/ActionIcons';
import { TimelineView } from './components/TimelineView';
import { CalendarIcon, ListIcon, TimelineIcon } from './components/icons/ViewIcons';
import { CrewListPage } from './components/CrewListPage';
import { PlannerIcon } from './components/icons/PlannerIcon';
import { CrewPlanner } from './components/CrewPlanner';
import { RosterPage } from './components/RosterPage';
import { getServiceWindow } from './utils/helpers';
import { fetchFlightData } from './utils/api';
import { processApiData } from './utils/dataProcessor';

type Assignments = Record<string, { arrival?: string; departure?: string }>;
type PinnedAssignments = Record<string, { arrival?: boolean; departure?: boolean }>;

type SimulationTeamState = {
    id: string;
    assignedJobs: { start: number; end: number }[];
    jobCount: number; // Track for load balancing
};

// --- HELPER ---
const getDateKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [turnarounds, setTurnarounds] = useState<Turnaround[]>([]);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [pinnedAssignments, setPinnedAssignments] = useState<PinnedAssignments>({});
  const [unassignedStatus, setUnassignedStatus] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [view, setView] = useState<'schedule' | 'timeline' | 'crew' | 'planner' | 'roster'>('schedule');
  const [isLoading, setIsLoading] = useState(true);
  const [customRoster, setCustomRoster] = useState<CustomRoster>(new Map());
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => getDateKey(new Date()));

  const loadInitialData = useCallback(async () => {
      setIsLoading(true);
      // Credentials are now handled by backend env
      const credentials = { appId: '', appKey: '' };
      const filters = { date: selectedDate }; 

      try {
        const jsonData = await fetchFlightData({
            credentials,
            filters,
            latestModTime: null,
            isUpdate: false
        });
        setIsApiOnline(true);
        const rawTurnarounds = processApiData(jsonData);
        const validTurnarounds = rawTurnarounds.filter(t => t.aircraftType !== 'AT7' && t.aircraftType !== 'AT76');

        if (validTurnarounds.length > 0) {
            setTurnarounds(validTurnarounds);
            setAssignments({});
            setPinnedAssignments({});
            setUnassignedStatus(new Set());
            setIsLoading(false);
        } else {
             setTurnarounds([]);
             setIsLoading(false);
        }
      } catch (apiError) {
        setIsApiOnline(false);
        console.log("Failed to load from backend API.", apiError);
        setIsLoading(false);
      }
    }, [selectedDate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const handleExportCsv = useCallback(() => {
    const dailyTurnarounds = turnarounds.filter(t => {
       const arrKey = t.arrival.sta ? getDateKey(new Date(t.arrival.sta)) : null;
       const depKey = t.departure.std ? getDateKey(new Date(t.departure.std)) : null;
       return arrKey === selectedDate || depKey === selectedDate;
    });

    if (dailyTurnarounds.length === 0) {
        alert("No flight data to export for this date.");
        return;
    }

    const headers = [
        "id", "aircraftType", "aircraftRegistration", "stand", "requiredTeamSize",
        "arrivalFlightNumber", "arrivalCity", "arrivalSTA", "arrivalETA", "arrivalATA",
        "departureFlightNumber", "departureCity", "departureSTD", "departureETD", "departureATD", "departureSlot",
        "arrivalRemarks", "departureRemarks"
    ];

    const rows = dailyTurnarounds.map(t => {
        const esc = (val: any) => {
            const s = String(val || '');
            return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        };

        return [
            esc(t.id),
            esc(t.aircraftType),
            esc(t.aircraftRegistration),
            esc(t.stand),
            esc(t.requiredTeamSize),
            esc(t.arrival.flightNumber),
            esc(t.arrival.city),
            esc(t.arrival.sta),
            esc(t.arrival.eta),
            esc(t.arrival.ata),
            esc(t.departure.flightNumber),
            esc(t.departure.city),
            esc(t.departure.std),
            esc(t.departure.etd),
            esc(t.departure.atd),
            esc(t.departure.slot),
            esc(t.arrivalRemarks),
            esc(t.departureRemarks)
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flight_schedule_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [turnarounds, selectedDate]);


  const handleAssignTeam = useCallback((turnaroundId: string, teamId: string, type: 'arrival' | 'departure') => {
    setUnassignedStatus(prev => {
        const newStatus = new Set(prev);
        newStatus.delete(`${turnaroundId}-${type}`);
        return newStatus;
    });

    setAssignments(prev => {
      const newAssignments = { ...prev };
      const currentAssignment = newAssignments[turnaroundId] || {};
      
      if (teamId === '') {
        delete currentAssignment[type];
        setPinnedAssignments(prevPinned => {
            const newPinned = {...prevPinned};
            if (newPinned[turnaroundId]) {
                delete newPinned[turnaroundId][type];
                if (Object.keys(newPinned[turnaroundId]).length === 0) {
                    delete newPinned[turnaroundId];
                }
            }
            return newPinned;
        });
      } else {
        currentAssignment[type] = teamId;
      }

      if (Object.keys(currentAssignment).length === 0) {
        delete newAssignments[turnaroundId];
      } else {
        newAssignments[turnaroundId] = currentAssignment;
      }
      
      return newAssignments;
    });
  }, []);

  const handleTogglePin = useCallback((turnaroundId: string, type: 'arrival' | 'departure') => {
    if (!assignments[turnaroundId] || !assignments[turnaroundId][type]) {
      return; 
    }
    setPinnedAssignments(prev => {
      const newPinned = { ...prev };
      const currentPins = newPinned[turnaroundId] || {};
      currentPins[type] = !currentPins[type];

      if (!currentPins.arrival && !currentPins.departure) {
        delete newPinned[turnaroundId];
      } else {
        newPinned[turnaroundId] = currentPins;
      }
      return newPinned;
    });
  }, [assignments]);
  
  const handleUpdateRemarks = useCallback((turnaroundId: string, type: 'arrival' | 'departure', newRemarks: string) => {
    setTurnarounds(prevTurnarounds => 
      prevTurnarounds.map(turnaround => {
        if (turnaround.id === turnaroundId) {
          const newTurnaround = { ...turnaround };
          if (type === 'arrival') {
            newTurnaround.arrivalRemarks = newRemarks;
          } else {
            newTurnaround.departureRemarks = newRemarks;
          }
          return newTurnaround;
        }
        return turnaround;
      })
    );
  }, []);
  
  const handleApplyPlannerTeams = useCallback((shifts: PlannerShift[], planDateKey?: string) => {
      const newTeams: Team[] = [];
      let teamCounter = 1;

      shifts.forEach(shift => {
          for (let i = 0; i < shift.teamCount; i++) {
             const teamId = `team_${teamCounter}`;
             const members: CrewMember[] = [
                 { name: `Crew ${teamCounter} Leader`, skill: Skill.LEADER, startHour: shift.startHour },
                 { name: `Crew ${teamCounter} Driver`, skill: Skill.DRIVER, startHour: shift.startHour },
                 { name: `Crew ${teamCounter} Headset`, skill: Skill.HEADSET, startHour: shift.startHour },
                 { name: `Crew ${teamCounter} Loader`, skill: Skill.LOADER, startHour: shift.startHour },
                 { name: `Crew ${teamCounter} Loader 2`, skill: Skill.LOADER, startHour: shift.startHour },
             ];
             
             newTeams.push({
                 id: teamId,
                 name: `Crew ${teamCounter}`,
                 shiftStartHour: shift.startHour,
                 shiftEndHour: shift.endHour,
                 members
             });
             teamCounter++;
          }
      });

      if (planDateKey && planDateKey !== selectedDate) {
          setSelectedDate(planDateKey);
      }
      const targetDate = planDateKey || selectedDate;

      setTeams(newTeams);
      setCustomRoster(new Map()); 
      setPinnedAssignments({});
      setUnassignedStatus(new Set());
      setAssignments({}); 

      alert(`Applied optimal plan: Created ${newTeams.length} teams for ${targetDate}. Click 'Auto-Assign Crew' to distribute flights.`);
      setView('schedule');
  }, [selectedDate]);

  const handleAutoAssign = useCallback(() => {
    setIsAssigning(true);
    
    setTimeout(() => {
        const BUFFER_MS = 10 * 60 * 1000; 
        const finalAssignments: Assignments = JSON.parse(JSON.stringify(assignments));
        
        const isLegOnDate = (timeStr: string | undefined) => {
            if (!timeStr) return false;
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return false;
            return getDateKey(d) === selectedDate;
        };

        turnarounds.forEach(t => {
            if (isLegOnDate(t.arrival.sta) && !pinnedAssignments[t.id]?.arrival) {
                if(finalAssignments[t.id]) delete finalAssignments[t.id].arrival;
            }
            if (isLegOnDate(t.departure.std) && !pinnedAssignments[t.id]?.departure) {
                if(finalAssignments[t.id]) delete finalAssignments[t.id].departure;
            }
            if (finalAssignments[t.id] && Object.keys(finalAssignments[t.id]).length === 0) {
                delete finalAssignments[t.id];
            }
        });

        const teamStates: Record<string, SimulationTeamState> = {};
        teams.forEach(t => {
            teamStates[t.id] = { id: t.id, assignedJobs: [], jobCount: 0 };
        });

        for (const tId in finalAssignments) {
            const t = turnarounds.find(tr => tr.id === tId);
            if (!t) continue;
            
            if (finalAssignments[tId].arrival && pinnedAssignments[tId]?.arrival) {
                const w = getServiceWindow(t, 'arrival');
                if (w) {
                    const tState = teamStates[finalAssignments[tId].arrival!];
                    if (tState) {
                        tState.assignedJobs.push({start: w[0], end: w[1]});
                        tState.jobCount++;
                    }
                }
            }
            if (finalAssignments[tId].departure && pinnedAssignments[tId]?.departure) {
                const w = getServiceWindow(t, 'departure');
                if (w) {
                    const tState = teamStates[finalAssignments[tId].departure!];
                    if (tState) {
                        tState.assignedJobs.push({start: w[0], end: w[1]});
                        tState.jobCount++;
                    }
                }
            }
        }

        type Task = { 
            id: string; 
            turnaroundId: string; 
            type: 'arrival' | 'departure'; 
            start: number; 
            end: number;
            turnaround: Turnaround; 
        };
        const tasks: Task[] = [];

        turnarounds.forEach(t => {
            const isCancelled = (remarks?: string) => remarks?.toLowerCase().includes('cancelled') || remarks === 'X';

            if (isLegOnDate(t.arrival.sta) && !pinnedAssignments[t.id]?.arrival && !isCancelled(t.arrivalRemarks)) {
                const w = getServiceWindow(t, 'arrival');
                if (w) tasks.push({ id: `${t.id}-A`, turnaroundId: t.id, type: 'arrival', start: w[0], end: w[1], turnaround: t });
            }
            if (isLegOnDate(t.departure.std) && !pinnedAssignments[t.id]?.departure && !isCancelled(t.departureRemarks)) {
                const w = getServiceWindow(t, 'departure');
                if (w) tasks.push({ id: `${t.id}-D`, turnaroundId: t.id, type: 'departure', start: w[0], end: w[1], turnaround: t });
            }
        });

        const departureTasks = tasks.filter(t => t.type === 'departure').sort((a,b) => a.start - b.start);
        const arrivalTasks = tasks.filter(t => t.type === 'arrival').sort((a,b) => a.start - b.start);

        const assignBatch = (batchTasks: Task[]) => {
            for (const task of batchTasks) {
                const availableCandidates: Team[] = [];

                for (const team of teams) {
                    const ts = teamStates[team.id];
                    const taskDate = new Date(task.start);
                    const shiftStartH = team.shiftStartHour;
                    const shiftEndH = team.shiftEndHour;
                    const taskStartH = taskDate.getHours() + taskDate.getMinutes()/60;

                    if (taskStartH < shiftStartH || taskStartH > shiftEndH) continue; 
                    if (team.members.length < task.turnaround.requiredTeamSize) continue;
                    
                    const hasOverlap = ts.assignedJobs.some(j => (task.start < j.end) && (task.end > j.start));
                    if (hasOverlap) continue;

                    const violatesBuffer = ts.assignedJobs.some(j => {
                        const gapBefore = task.start - j.end;
                        const gapAfter = j.start - task.end;
                        if (gapBefore >= 0 && gapBefore < BUFFER_MS) return true;
                        if (gapAfter >= 0 && gapAfter < BUFFER_MS) return true;
                        return false;
                    });
                    if (violatesBuffer) continue;

                    availableCandidates.push(team);
                }

                if (availableCandidates.length > 0) {
                    availableCandidates.sort((a, b) => {
                        const loadA = teamStates[a.id].jobCount;
                        const loadB = teamStates[b.id].jobCount;
                        if (loadA !== loadB) return loadA - loadB;
                        return a.id.localeCompare(b.id);
                    });

                    const chosenTeam = availableCandidates[0];
                    const ts = teamStates[chosenTeam.id];

                    if (!finalAssignments[task.turnaroundId]) finalAssignments[task.turnaroundId] = {};
                    finalAssignments[task.turnaroundId][task.type] = chosenTeam.id;
                    ts.assignedJobs.push({ start: task.start, end: task.end });
                    ts.jobCount++;
                }
            }
        };

        assignBatch(departureTasks);
        assignBatch(arrivalTasks);

        setAssignments(finalAssignments);
        
        const newUnassignedStatus = new Set<string>();
        for (const turnaround of turnarounds) {
            const assignment = finalAssignments[turnaround.id] as { arrival?: string; departure?: string } | undefined;
            if (isLegOnDate(turnaround.arrival.sta) && !assignment?.arrival) newUnassignedStatus.add(`${turnaround.id}-arrival`);
            if (isLegOnDate(turnaround.departure.std) && !assignment?.departure) newUnassignedStatus.add(`${turnaround.id}-departure`);
        }
        setUnassignedStatus(newUnassignedStatus);
        
        setIsAssigning(false);
    }, 500);
  }, [teams, turnarounds, assignments, pinnedAssignments, selectedDate]);

  const handleMoveCrewMember = useCallback((memberName: string, sourceTeamId: string, destinationTeamId: string) => {
    setTeams(prevTeams => {
        const sourceTeam = prevTeams.find(t => t.id === sourceTeamId);
        const destTeam = prevTeams.find(t => t.id === destinationTeamId);
        if (!sourceTeam || !destTeam) return prevTeams;
        const memberIndex = sourceTeam.members.findIndex(m => m.name === memberName);
        if (memberIndex === -1) return prevTeams;
        const [movedMember] = sourceTeam.members.splice(memberIndex, 1);
        destTeam.members.push(movedMember);
        return [...prevTeams];
    });
  }, []);

  const handleSwapCrewMembers = useCallback((draggedMemberName: string, sourceTeamId: string, targetMemberName: string, destinationTeamId: string) => {
      setTeams(prevTeams => {
          const sourceTeam = prevTeams.find(t => t.id === sourceTeamId);
          const destTeam = prevTeams.find(t => t.id === destinationTeamId);
          if (!sourceTeam || !destTeam) return prevTeams;
          const sourceMemberIndex = sourceTeam.members.findIndex(m => m.name === draggedMemberName);
          const destMemberIndex = destTeam.members.findIndex(m => m.name === targetMemberName);
          if (sourceMemberIndex === -1 || destMemberIndex === -1) return prevTeams;
          
          const newSourceMembers = [...sourceTeam.members];
          const newDestMembers = [...destTeam.members];
          const [movedSource] = newSourceMembers.splice(sourceMemberIndex, 1);
          const [movedDest] = newDestMembers.splice(destMemberIndex, 1);
          
          newSourceMembers.splice(sourceMemberIndex, 0, { ...movedDest, startHour: sourceTeam.shiftStartHour });
          newDestMembers.splice(destMemberIndex, 0, { ...movedSource, startHour: destTeam.shiftStartHour });

          return prevTeams.map(t => {
              if (t.id === sourceTeamId) return { ...t, members: newSourceMembers };
              if (t.id === destinationTeamId) return { ...t, members: newDestMembers };
              return t;
          });
      });
  }, []);

  const handleUpdateCrewSkill = useCallback((memberName: string, oldSkill: Skill, newSkill: Skill) => {
    setTeams(prevTeams => prevTeams.map(team => ({
        ...team,
        members: team.members.map(m => m.name === memberName ? { ...m, skill: newSkill } : m)
    })));
  }, []);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
              <div className="animate-spin text-[#00624D] mb-4">
                  <SpinnerIcon className="h-12 w-12" />
              </div>
              <p className="text-slate-600 font-medium animate-pulse">Connecting to DAA Flight Systems...</p>
          </div>
      );
  }

  const dailyFlightCount = turnarounds.filter(t => {
       const arrKey = t.arrival.sta ? getDateKey(new Date(t.arrival.sta)) : null;
       const depKey = t.departure.std ? getDateKey(new Date(t.departure.std)) : null;
       return arrKey === selectedDate || depKey === selectedDate;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      <header className="bg-[#00624D] text-white shadow-lg sticky top-0 z-40">
        <div className="px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm relative">
                <PlaneTakeoffIcon className="h-6 w-6 text-white" />
                {isApiOnline && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-[#00624D]"></span>
                    </span>
                )}
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">Aerfoirt Foireann</h1>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-teal-100 font-medium tracking-wide opacity-80">GROUND OPERATIONS MANAGER</p>
                    <button 
                        onClick={handleExportCsv}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-800 hover:bg-teal-700 text-[10px] font-bold text-teal-50 border border-teal-600/50 shadow-sm transition-all active:scale-95 ml-2"
                        title="Export current flight plan to CSV"
                    >
                        <DownloadIcon className="h-3 w-3" />
                        Export Flight Plan
                        <span className="ml-1 px-1.5 py-0.5 bg-teal-900/50 rounded-full text-[9px]">{dailyFlightCount}</span>
                    </button>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex bg-[#004f3d] rounded-lg p-1 shadow-inner">
               <button onClick={() => setView('schedule')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'schedule' ? 'bg-white text-[#00624D] shadow-sm' : 'text-teal-100 hover:bg-[#005c46]'}`}>
                   <ListIcon className="h-4 w-4 inline mr-2"/>Schedule
               </button>
               <button onClick={() => setView('timeline')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'timeline' ? 'bg-white text-[#00624D] shadow-sm' : 'text-teal-100 hover:bg-[#005c46]'}`}>
                   <TimelineIcon className="h-4 w-4 inline mr-2"/>Timeline
               </button>
               <button onClick={() => setView('crew')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'crew' ? 'bg-white text-[#00624D] shadow-sm' : 'text-teal-100 hover:bg-[#005c46]'}`}>
                   <UsersIcon className="h-4 w-4 inline mr-2"/>Crew List
               </button>
               <button onClick={() => setView('roster')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'roster' ? 'bg-white text-[#00624D] shadow-sm' : 'text-teal-100 hover:bg-[#005c46]'}`}>
                   <CalendarIcon className="h-4 w-4 inline mr-2"/>Roster
               </button>
               <button onClick={() => setView('planner')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${view === 'planner' ? 'bg-white text-[#00624D] shadow-sm' : 'text-teal-100 hover:bg-[#005c46]'}`}>
                   <PlannerIcon className="h-4 w-4 inline mr-2"/>Planner
               </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'schedule' && (
            <>
                <div className="bg-white border-b border-slate-200 px-7 py-3 flex items-center justify-between shadow-sm sticky top-[4rem] z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleAutoAssign}
                            disabled={isAssigning}
                            className="flex items-center gap-2 px-4 py-2 bg-[#00624D] hover:bg-[#004f3d] text-white rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isAssigning ? <SpinnerIcon className="h-4 w-4 animate-spin"/> : <RobotIcon className="h-4 w-4" />}
                            <span className="text-sm font-bold">Auto-Assign Crew</span>
                        </button>
                        {unassignedStatus.size > 0 && (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                                {unassignedStatus.size} Unassigned Tasks
                            </span>
                        )}
                    </div>
                </div>
                <FlightScheduleTable 
                    turnarounds={turnarounds}
                    teams={teams}
                    assignments={assignments}
                    onAssignTeam={handleAssignTeam}
                    pinnedAssignments={pinnedAssignments}
                    onTogglePin={handleTogglePin}
                    unassignedStatus={unassignedStatus}
                    onUpdateRemarks={handleUpdateRemarks}
                    onRefresh={loadInitialData}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
            </>
        )}
        
        {view === 'timeline' && (
             <TimelineView 
                flights={turnarounds.flatMap(t => {
                     const flights: Flight[] = [];
                     const getFlight = (type: 'arrival' | 'departure') => {
                         const info = type === 'arrival' ? t.arrival : t.departure;
                         if (!info.flightNumber) return null;
                         const time = type === 'arrival' ? info.sta : info.std;
                         if (!time) return null;
                         const date = new Date(time);
                         if (getDateKey(date) !== selectedDate) return null;
                         
                         const actual = type === 'arrival' ? info.ata : info.atd;
                         const isComp = !!actual;
                         const remarks = type === 'arrival' ? t.arrivalRemarks : t.departureRemarks;
                         const isCancelled = remarks?.toLowerCase().includes('cancelled') || remarks === 'X';
                         
                         let status = FlightStatus.Scheduled;
                         if (isCancelled) status = FlightStatus.Delayed; // Visual placeholder
                         else if (isComp) status = type === 'arrival' ? FlightStatus.Arrived : FlightStatus.Departed;
                         
                         // Determine duration
                         const w = getServiceWindow(t, type);
                         const duration = w ? (w[1] - w[0]) / 60000 : 45;

                         return {
                             id: `${t.id}-${type}`, // Must match assignment key
                             flightNumber: info.flightNumber,
                             isArrival: type === 'arrival',
                             sta: time,
                             std: time, // simplified
                             status,
                             serviceDurationMinutes: duration
                         };
                     };
                     const arr = getFlight('arrival');
                     const dep = getFlight('departure');
                     if (arr) flights.push(arr);
                     if (dep) flights.push(dep);
                     return flights;
                })}
                teams={teams}
                assignments={Object.entries(assignments).reduce((acc, [tId, assign]) => {
                    const val = assign as { arrival?: string; departure?: string };
                    if (val.arrival) acc[`${tId}-arrival`] = val.arrival;
                    if (val.departure) acc[`${tId}-departure`] = val.departure;
                    return acc;
                }, {} as Record<string, string>)}
                onMoveCrewMember={handleMoveCrewMember}
                onSwapCrewMembers={handleSwapCrewMembers}
             />
        )}

        {view === 'crew' && (
            <CrewListPage 
                teams={teams} 
                onUpdateCrewSkill={handleUpdateCrewSkill} 
                customRoster={customRoster}
            />
        )}

        {view === 'roster' && (
            <RosterPage teams={teams} customRoster={customRoster} />
        )}

        {view === 'planner' && (
            <CrewPlanner turnarounds={turnarounds} onApplyPlan={handleApplyPlannerTeams} />
        )}
      </main>
    </div>
  );
};

export default App;