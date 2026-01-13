import React, { useMemo } from 'react';
import type { Turnaround, Team, FlightInfo } from '../types';
import { TeamSelector } from './TeamSelector';
import { PinIcon } from './icons/ActionIcons';
import { PlaneArrivalIcon, PlaneDepartureIcon } from './icons/PlaneIcon';
import { AirlineLogo } from './AirlineLogo';

interface FlightScheduleTableProps {
  turnarounds: Turnaround[];
  teams: Team[];
  assignments: Record<string, { arrival?: string; departure?: string }>;
  onAssignTeam: (turnaroundId: string, teamId: string, type: 'arrival' | 'departure') => void;
  pinnedAssignments: Record<string, { arrival?: boolean; departure?: boolean }>;
  onTogglePin: (turnaroundId: string, type: 'arrival' | 'departure') => void;
  unassignedStatus: Set<string>;
  onUpdateRemarks: (turnaroundId: string, type: 'arrival' | 'departure', newRemarks: string) => void;
  onRefresh: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const HeaderCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = ''}) => (
    <div className={`text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${className}`}>
        {children}
    </div>
);

const TimeCell: React.FC<{ time?: string, isActual?: boolean, isEstimated?: boolean, isSlot?: boolean }> = ({ time, isActual, isEstimated, isSlot }) => {
    const baseStyle = 'h-6 w-12 flex items-center justify-center text-[11px] font-mono rounded-md border shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105';

    if (!time) {
        return (
            <div className={`${baseStyle} border-slate-200 bg-slate-50 text-slate-400`}>
                -
            </div>
        );
    }
    
    const date = new Date(time);

    if (isNaN(date.getTime())) {
        return (
            <div className={`${baseStyle} border-slate-200 bg-slate-50 text-slate-400`}>
                -
            </div>
        );
    }
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    let timeClass = 'text-slate-700 border-slate-300 bg-white hover:bg-slate-100 hover:border-slate-400';
    if (isActual) timeClass = 'font-bold text-green-800 border-green-300 bg-green-100 hover:bg-green-200 hover:border-green-400';
    else if (isEstimated) timeClass = 'text-teal-800 border-teal-300 bg-teal-100 hover:bg-teal-200 hover:border-teal-400';
    else if (isSlot) timeClass = 'text-purple-800 border-purple-300 bg-purple-100 hover:bg-purple-200 hover:border-purple-400';

    return (
        <div className={`${baseStyle} ${timeClass}`} title={date.toLocaleString()}>
            {formattedTime}
        </div>
    );
};

const formatFlightNumber = (fn?: string) => {
    if (!fn) return '';
    // Use first part of the flight number if it contains separators (e.g. "EI100/BA5000" -> "EI100")
    // Split by slash, comma, or " / " 
    return fn.split(/[\/,]/)[0].trim();
};

const FlightLegRow: React.FC<{
    turnaround: Turnaround;
    type: 'arrival' | 'departure';
    flightInfo: Partial<FlightInfo>;
    onAssignTeam: (turnaroundId: string, teamId: string, type: 'arrival' | 'departure') => void;
    assignments: Record<string, { arrival?: string; departure?: string }>;
    teams: Team[];
    allTurnarounds: Turnaround[];
    isCompleted: boolean;
    pinnedAssignments: Record<string, { arrival?: boolean; departure?: boolean }>;
    onTogglePin: (turnaroundId: string, type: 'arrival' | 'departure') => void;
    isUnassigned: boolean;
    onUpdateRemarks: (turnaroundId: string, type: 'arrival' | 'departure', newRemarks: string) => void;
}> = ({ turnaround, type, flightInfo, onAssignTeam, assignments, teams, allTurnarounds, isCompleted, pinnedAssignments, onTogglePin, isUnassigned, onUpdateRemarks }) => {
    
    const Icon = type === 'arrival' ? PlaneArrivalIcon : PlaneDepartureIcon;
    const label = type === 'arrival' ? 'Arrival' : 'Departure';
    
    const remarks = type === 'arrival' ? turnaround.arrivalRemarks : turnaround.departureRemarks;
    // Check for "Cancelled" text OR a generic "X" status code
    const isCancelled = remarks && (
        remarks.toLowerCase().includes('cancelled') || 
        remarks.toLowerCase().includes('canceled') || 
        remarks.trim().toUpperCase() === 'X'
    );

    const statusClass = isCancelled 
        ? 'bg-red-100 border-red-300' 
        : (isCompleted ? 'bg-slate-50' : 'bg-white');
    
    const isAssigned = !!assignments[turnaround.id]?.[type];
    const isPinned = !!pinnedAssignments[turnaround.id]?.[type];
    const unassignedClass = !isCancelled && isUnassigned && !isAssigned ? 'ring-1 ring-red-500' : '';

    // Aer Lingus colors: Arrival -> #00624D (Shamrock), Departure -> #A1C935 (Lime) or Teal
    const iconColorClass = type === 'arrival' ? 'text-[#00624D]' : 'text-[#008670]';

    const mainFlightNumber = formatFlightNumber(flightInfo.flightNumber);

    return (
        <div className={`p-3 transition-colors rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md ${statusClass} ${unassignedClass}`}>
             <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${iconColorClass}`} />
                <h3 className="font-bold text-slate-700 text-[10px] uppercase tracking-wide">{label}</h3>
                {isCancelled && <span className="text-[10px] text-red-700 font-bold bg-white border border-red-200 px-1.5 py-0.5 rounded-full ml-auto shadow-sm">CANCELLED</span>}
                {!isCancelled && isCompleted && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full ml-auto">Completed</span>}
             </div>
             <div className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_0.4fr_0.6fr_0.6fr_0.6fr_0.6fr_1.7fr_2fr] gap-x-4 items-center text-xs">
                <div className="font-medium text-slate-600 text-center">{flightInfo.city || '-'}</div>
                
                <div className="font-bold text-slate-900 text-center text-sm flex items-center justify-center gap-2">
                    <AirlineLogo flightNumber={mainFlightNumber} className="h-5 w-5" />
                    {mainFlightNumber}
                </div>
                 <div className="font-mono text-slate-500 text-center text-[11px]">{turnaround.aircraftRegistration}</div>
                 <div className="text-slate-600 text-center font-medium">{turnaround.aircraftType}</div>
                 <div className="font-bold text-slate-800 text-center">{turnaround.stand}</div>
                 
                 <TimeCell time={type === 'arrival' ? flightInfo.sta : flightInfo.std} />
                 <TimeCell time={type === 'arrival' ? flightInfo.eta : flightInfo.etd} isEstimated />
                 <TimeCell time={flightInfo.slot} isSlot />
                 <TimeCell time={type === 'arrival' ? flightInfo.ata : flightInfo.atd} isActual />

                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={(type === 'arrival' ? turnaround.arrivalRemarks : turnaround.departureRemarks) || ''}
                        onChange={(e) => onUpdateRemarks(turnaround.id, type, e.target.value)}
                        placeholder="Remarks..."
                        className={`w-full bg-transparent text-center text-[11px] border-b border-slate-200 focus:border-[#00624D] focus:outline-none focus:bg-slate-50 py-1 transition-colors ${isCancelled ? 'text-red-700 font-bold placeholder-red-300' : 'text-slate-600'}`}
                        aria-label={`${type} remarks`}
                    />
                </div>

                <div className="flex items-center justify-center gap-2">
                     {!isCancelled ? (
                         <>
                            <TeamSelector
                                turnaround={turnaround}
                                type={type}
                                teams={teams}
                                assignedTeamId={assignments[turnaround.id]?.[type] || ''}
                                onAssign={(teamId) => onAssignTeam(turnaround.id, teamId, type)}
                                allAssignments={assignments}
                                allTurnarounds={allTurnarounds}
                                disabled={isPinned}
                                isUnassigned={isUnassigned}
                            />
                            <button
                                onClick={() => onTogglePin(turnaround.id, type)}
                                disabled={!isAssigned}
                                className={`p-1.5 rounded-full transition-colors ${isPinned ? 'text-[#00624D] bg-teal-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                aria-label={isPinned ? "Unpin assignment" : "Pin assignment"}
                                title={isPinned ? "Unpin assignment" : "Pin assignment"}
                            >
                                <PinIcon filled={isPinned} className="h-3.5 w-3.5" />
                            </button>
                        </>
                     ) : (
                         <div className="h-7 flex items-center justify-center w-full bg-white/50 rounded border border-red-200">
                             <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">No Crew Reqd</span>
                         </div>
                     )}
                </div>
             </div>
        </div>
    );
};


export const FlightScheduleTable: React.FC<FlightScheduleTableProps> = ({
  turnarounds,
  teams,
  assignments,
  onAssignTeam,
  pinnedAssignments,
  onTogglePin,
  unassignedStatus,
  onUpdateRemarks,
  onRefresh,
  selectedDate,
  onDateChange,
}) => {
  // Helper to get local date key "YYYY-MM-DD"
  const getDateKey = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Generate Yesterday, Today, Tomorrow buttons
  const dateTabs = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    
    const formatLabel = (d: Date, label: string) => {
       const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
       return `${label}, ${datePart}`;
    };

    return [
        { key: getDateKey(yesterday), label: formatLabel(yesterday, 'Yesterday') },
        { key: getDateKey(today), label: formatLabel(today, 'Today') },
        { key: getDateKey(tomorrow), label: formatLabel(tomorrow, 'Tomorrow') },
    ];
  }, []);

  const flightLegs = useMemo(() => {
    const legs: {
        uniqueId: string;
        turnaround: Turnaround;
        type: 'arrival' | 'departure';
        time: number;
        flightInfo: Partial<FlightInfo>;
    }[] = [];

    turnarounds.forEach(t => {
        if (t.arrival.flightNumber) {
            const timeStr = t.arrival.sta || t.arrival.eta || t.arrival.ata;
            const time = timeStr ? new Date(timeStr).getTime() : 0;
            legs.push({
                uniqueId: `${t.id}-arrival`,
                turnaround: t,
                type: 'arrival',
                time,
                flightInfo: t.arrival
            });
        }
        if (t.departure.flightNumber) {
            const timeStr = t.departure.std || t.departure.etd || t.departure.atd;
            const time = timeStr ? new Date(timeStr).getTime() : 0;
            legs.push({
                uniqueId: `${t.id}-departure`,
                turnaround: t,
                type: 'departure',
                time,
                flightInfo: t.departure
            });
        }
    });

    // Sort chronologically
    const sortedLegs = legs.sort((a, b) => {
        if (a.time === 0 && b.time === 0) return 0;
        if (a.time === 0) return 1;
        if (b.time === 0) return -1;
        return a.time - b.time;
    });

    // Apply Filter based on Local Date
    return sortedLegs.filter(leg => {
       if (leg.time === 0) return false;
       const legDateKey = getDateKey(new Date(leg.time));
       return legDateKey === selectedDate;
    });

  }, [turnarounds, selectedDate]);

  const stats = useMemo(() => {
      let arrSched = 0, arrAct = 0;
      let depSched = 0, depAct = 0;

      flightLegs.forEach(leg => {
          if (leg.type === 'arrival') {
              arrSched++;
              if (leg.flightInfo.ata) arrAct++;
          } else {
              depSched++;
              if (leg.flightInfo.atd) depAct++;
          }
      });
      return { arrSched, arrAct, depSched, depAct };
  }, [flightLegs]);

  const isFlightCompleted = (flightInfo: Partial<FlightInfo>, type: 'arrival' | 'departure'): boolean => {
    const actualTimeStr = type === 'arrival' ? flightInfo.ata : flightInfo.atd;
    return !!actualTimeStr;
  };

  return (
    <div>
      {/* Date Filter Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-7 py-3 flex items-center justify-center gap-3 sticky top-[4rem] z-30 overflow-x-auto">
        
        {/* Stats Badges */}
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
            {/* Refresh Button */}
            <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                title="Refresh Flight Data"
            >
                <span className="text-sm font-mono font-bold text-slate-700">Refresh</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm" title="Arrivals: Actual / Scheduled">
                <PlaneArrivalIcon className="h-4 w-4 text-[#00624D]" />
                <span className="text-sm font-mono font-bold text-slate-700">
                    <span className={stats.arrAct === stats.arrSched && stats.arrSched > 0 ? "text-[#00624D]" : "text-slate-900"}>{stats.arrAct}</span>
                    <span className="text-slate-300 mx-0.5">/</span>
                    <span className="text-slate-500">{stats.arrSched}</span>
                </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm" title="Departures: Actual / Scheduled">
                <PlaneDepartureIcon className="h-4 w-4 text-[#008670]" />
                <span className="text-sm font-mono font-bold text-slate-700">
                    <span className={stats.depAct === stats.depSched && stats.depSched > 0 ? "text-[#00624D]" : "text-slate-900"}>{stats.depAct}</span>
                    <span className="text-slate-300 mx-0.5">/</span>
                    <span className="text-slate-500">{stats.depSched}</span>
                </span>
            </div>
        </div>

        {dateTabs.map(tab => (
            <button
                key={tab.key}
                onClick={() => onDateChange(tab.key)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    selectedDate === tab.key
                        ? 'bg-[#00624D] text-white shadow-md ring-2 ring-teal-100 ring-offset-1 transform scale-105' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_0.4fr_0.6fr_0.6fr_0.6fr_0.6fr_1.7fr_2fr] gap-x-4 px-7 py-3 border-b border-slate-200 sticky top-[7.5rem] z-20 bg-white/95 backdrop-blur shadow-sm">
        <HeaderCell>Origin/Dest</HeaderCell>
        <HeaderCell>Flight</HeaderCell>
        <HeaderCell>Reg</HeaderCell>
        <HeaderCell>Type</HeaderCell>
        <HeaderCell>Stand</HeaderCell>
        <HeaderCell>Scheduled</HeaderCell>
        <HeaderCell>Estimated</HeaderCell>
        <HeaderCell>Slot</HeaderCell>
        <HeaderCell>Actual</HeaderCell>
        <HeaderCell>Remarks</HeaderCell>
        <HeaderCell>Crew</HeaderCell>
      </div>

      {/* Body */}
      <div className="space-y-2 p-4">
        {flightLegs.length === 0 ? (
            <div className="text-center py-12">
                <p className="text-slate-400 text-sm italic">No flights scheduled for this date.</p>
            </div>
        ) : (
            flightLegs.map((leg) => {
                const { uniqueId, turnaround, type, flightInfo } = leg;
                const isCompleted = isFlightCompleted(flightInfo, type);
                const isUnassigned = unassignedStatus.has(`${turnaround.id}-${type}`);

                return (
                    <React.Fragment key={uniqueId}>
                        <FlightLegRow 
                            turnaround={turnaround}
                            type={type}
                            flightInfo={flightInfo}
                            onAssignTeam={onAssignTeam}
                            assignments={assignments}
                            teams={teams}
                            allTurnarounds={turnarounds}
                            isCompleted={isCompleted}
                            pinnedAssignments={pinnedAssignments}
                            onTogglePin={onTogglePin}
                            isUnassigned={isUnassigned}
                            onUpdateRemarks={onUpdateRemarks}
                        />
                    </React.Fragment>
                );
            })
        )}
      </div>
    </div>
  );
};