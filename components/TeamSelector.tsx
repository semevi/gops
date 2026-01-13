import React, { useMemo, useCallback } from 'react';
import type { Turnaround, Team } from '../types';
import { getServiceWindow } from '../utils/helpers';

type AssignmentType = 'arrival' | 'departure';
type Assignments = Record<string, { arrival?: string; departure?: string }>;

interface TeamSelectorProps {
  turnaround: Turnaround;
  type: AssignmentType,
  teams: Team[];
  assignedTeamId: string;
  onAssign: (teamId: string) => void;
  allAssignments: Assignments;
  allTurnarounds: Turnaround[];
  disabled?: boolean;
  isUnassigned?: boolean;
}

interface AvailabilityStatus {
  isAvailable: boolean;
  conflictingFlight?: string;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  turnaround,
  type,
  teams,
  assignedTeamId,
  onAssign,
  allAssignments,
  allTurnarounds,
  disabled = false,
  isUnassigned = false,
}) => {
  
  const getTeamAvailability = useCallback((team: Team): AvailabilityStatus => {
    const currentWindow = getServiceWindow(turnaround, type);
    if (!currentWindow) return { isAvailable: false };
    const [currentStart, currentEnd] = currentWindow;

    // Check for flight conflicts
    for (const turnaroundId in allAssignments) {
        const assignment = allAssignments[turnaroundId];
        const assignedTurnaround = allTurnarounds.find(t => t.id === turnaroundId);
        if (!assignedTurnaround) continue;

        const checkConflict = (assignmentType: AssignmentType, flightNumber?: string) => {
            if (assignment[assignmentType] === team.id) {
                if (turnaroundId !== turnaround.id || type !== assignmentType) {
                    const assignedWindow = getServiceWindow(assignedTurnaround, assignmentType);
                    if (assignedWindow && currentStart < assignedWindow[1] && currentEnd > assignedWindow[0]) {
                        return { isAvailable: false, conflictingFlight: flightNumber };
                    }
                }
            }
            return null;
        }

        let conflict = checkConflict('arrival', assignedTurnaround.arrival.flightNumber);
        if (conflict) return conflict;
        
        conflict = checkConflict('departure', assignedTurnaround.departure.flightNumber);
        if (conflict) return conflict;
    }

    return { isAvailable: true };
  }, [turnaround, type, allAssignments, allTurnarounds]);


  const allSortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
        const numA = parseInt(a.name.replace('Crew ', ''), 10);
        const numB = parseInt(b.name.replace('Crew ', ''), 10);
        return numA - numB;
    });
  }, [teams]);

  const teamOptions = useMemo(() => {
     return allSortedTeams.map(team => ({
        team,
        availability: getTeamAvailability(team)
     }));
  }, [allSortedTeams, getTeamAvailability]);

  const isActuallyUnassigned = isUnassigned && assignedTeamId === '';
  const selectorClasses = isActuallyUnassigned && !disabled
    ? 'border-red-500 ring-1 ring-red-500 bg-white' 
    : 'border-slate-300 bg-white';

  return (
    <select
      value={assignedTeamId}
      onChange={(e) => onAssign(e.target.value)}
      disabled={disabled}
      className={`block w-full pl-3 pr-10 py-1 text-[11px] focus:outline-none focus:ring-[#00624D] focus:border-[#00624D] rounded-md shadow-sm disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed ${selectorClasses}`}
    >
      <option value="">{isActuallyUnassigned ? 'No Crew Available' : 'Unassigned'}</option>
      {teamOptions.map(({team, availability}) => {
        const isBusy = !availability.isAvailable && team.id !== assignedTeamId;
        return (
          <option 
            key={team.id} 
            value={team.id} 
            className={isBusy ? 'text-amber-600 font-semibold' : ''}
          >
            {team.name} {isBusy ? `⚠ ${availability.conflictingFlight || 'Busy'}` : ''}
          </option>
        )
      })}
    </select>
  );
};