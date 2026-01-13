import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FlightScheduleTable } from './components/FlightScheduleTable';
import { MOCK_TEAMS } from './constants';
import { FlightStatus, Skill } from './types';
import type { Turnaround, Team, Flight, Break, CrewMember, CustomRoster, CustomShift, PlannerShift } from './types';
import { PlaneTakeoffIcon } from './components/icons/PlaneIcon';
import { RobotIcon, SpinnerIcon, UsersIcon, UploadIcon, ReloadIcon } from './components/icons/ActionIcons';
import { TimelineView } from './components/TimelineView';
import { CalendarIcon, ListIcon, TimelineIcon } from './components/icons/ViewIcons';
import { CrewListPage } from './components/CrewListPage';
import { PlannerIcon } from './components/icons/PlannerIcon';
import { CrewPlanner } from './components/CrewPlanner';
import { RosterPage } from './components/RosterPage';
import { generateRosterForMemberForMonth } from './utils/roster';
import { getServiceWindow, isWideBody } from './utils/helpers';
import { fetchFlightData } from './utils/api';

declare var XLSX: any;

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

// --- API PROCESSING HELPERS ---
const createTurnaroundFromLegs = (arrival: any, departure: any): Turnaround => {
    const primary = arrival || departure;
    const id = primary.flightNumber 
        ? `${primary.flightNumber}_${new Date(primary.sta).getTime()}`
        : `turn_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        id: id,
        aircraftType: primary.type || '320',
        aircraftRegistration: primary.reg || '',
        stand: primary.stand || '',
        requiredTeamSize: 3,
        arrival: arrival ? {
            flightNumber: arrival.flightNumber,
            city: arrival.origin,
            sta: arrival.sta,
            eta: arrival.estimated,
            ata: arrival.actual,
        } : {},
        departure: departure ? {
            flightNumber: departure.flightNumber,
            city: departure.destination,
            std: departure.sta,
            etd: departure.estimated,
            atd: departure.actual,
            slot: departure.slot
        } : {},
        arrivalRemarks: arrival?.status,
        departureRemarks: departure?.status
    };
};

const processApiData = (jsonData: any): Turnaround[] => {
  const flightsData = jsonData?.Flights || (Array.isArray(jsonData) ? jsonData : []);
  if (!Array.isArray(flightsData)) return [];

  const mapStatus = (code: string | undefined) => {
      switch (code) {
          case 'S': return 'Scheduled';
          case 'A': return 'Active';
          case 'L': return 'Landed';
          case 'D': return 'Diverted';
          case 'C': return 'Cancelled';
          case 'X': return 'Cancelled';
          case 'F': return 'Final Approach';
          case 'E': return 'Estimated';
          case 'O': return 'On Block';
          case 'Z': return 'Off Block';
          default: return code;
      }
  };

  const normalize = (record: any) => {
    const fId = record.FlightIdentification || {};
    const fData = record.FlightData || {};
    const opsTimes = fData.OperationalTimes || {};
    const cdm = record.CDMInfoFields || {};
    const airport = fData.Airport || {};
    const standInfo = airport.Stand || {};
    const aircraft = fData.Aircraft || {};
    const flightMisc = fData.Flight || {};

    const flightNumber = fId.FlightIdentity;
    const codeShareStatus = fId.CodeShareStatus;
    
    const dirString = fId.FlightDirection;
    let direction: 'arrival' | 'departure' | 'unknown' = 'unknown';
    if (dirString === 'Arrival') direction = 'arrival';
    else if (dirString === 'Departure') direction = 'departure';

    const sta = opsTimes.ScheduledDateTime;

    let estimated = opsTimes.EstimatedDateTime;
    if (direction === 'arrival' && opsTimes.EstimatedOnBlocksDateTime) {
        estimated = opsTimes.EstimatedOnBlocksDateTime;
    } else if (direction === 'departure' && opsTimes.EstimatedOffBlocksDateTime) {
        estimated = opsTimes.EstimatedOffBlocksDateTime;
    }

    let actual = undefined;
    if (direction === 'arrival') {
        actual = opsTimes.ActualOnBlocksDateTime || opsTimes.WheelsDownDateTime;
    } else if (direction === 'departure') {
        actual = opsTimes.ActualOffBlocksDateTime || opsTimes.WheelsUpDateTime;
    }

    const slot = cdm.CalculatedTakeOffDateTime;
    const reg = aircraft.AircraftRegistration;
    const type = aircraft.AircraftTypeICAOCode;
    const stand = standInfo.StandPosition;
    const origin = flightMisc.OriginAirportIATACode;
    const destination = flightMisc.DestinationAirportIATACode;
    const status = mapStatus(flightMisc.FlightStatusCode);

    return { flightNumber, codeShareStatus, direction, sta, estimated, actual, slot, reg, type, stand, origin, destination, status, raw: record };
  };

  const flights = flightsData.map(normalize).filter(f => {
      if (!f.flightNumber || !f.sta) return false;
      if (f.codeShareStatus) {
          const csNum = parseInt(f.codeShareStatus, 10);
          if (!isNaN(csNum) && csNum > 0) return false;
          if (f.codeShareStatus === 'S') return false;
      }
      return true;
  });

  const turnarounds: Turnaround[] = [];
  const flightsByReg: Record<string, typeof flights> = {};
  const singles: typeof flights = [];

  flights.forEach(f => {
    if (f.reg) {
      if (!flightsByReg[f.reg]) flightsByReg[f.reg] = [];
      flightsByReg[f.reg].push(f);
    } else {
      singles.push(f);
    }
  });

  const getAirlineScore = (f: any) => {
        const prefix = f.flightNumber.substring(0, 2).toUpperCase();
        const numberPart = parseInt(f.flightNumber.replace(/\D/g, ''), 10) || 0;
        if (['EI', 'BA', 'IB', 'VY', 'QF', 'AY'].includes(prefix) && numberPart >= 4000) return 1;
        if (prefix === 'EI') return 20;
        if (prefix === 'EA') return 18;
        if (['AA', 'UA', 'DL', 'AC', 'TS', 'ET', 'EK', 'QR', 'BA', 'IB', 'VY'].includes(prefix)) return 15;
        return 5;
  };

  Object.values(flightsByReg).forEach(group => {
    group.sort((a, b) => {
        const timeDiff = new Date(a.sta).getTime() - new Date(b.sta).getTime();
        if (timeDiff !== 0) return timeDiff;
        const getRegScore = (f: any) => {
            const reg = (f.reg || '').toUpperCase();
            const prefix = f.flightNumber.substring(0, 2).toUpperCase();
            if (reg.startsWith('EI') && prefix === 'EI') return 100;
            if (reg.startsWith('G') && prefix === 'BA') return 100;
            if (reg.startsWith('N') && prefix === 'AA') return 100;
            return 0;
        };
        const regScoreDiff = getRegScore(b) - getRegScore(a);
        if (regScoreDiff !== 0) return regScoreDiff;
        const getCodeShareScore = (f: any) => (f.codeShareStatus === 'P' ? 10 : 5);
        const csScoreDiff = getCodeShareScore(b) - getCodeShareScore(a);
        if (csScoreDiff !== 0) return csScoreDiff;
        const scoreDiff = getAirlineScore(b) - getAirlineScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return a.flightNumber.localeCompare(b.flightNumber);
    });

    const uniqueGroup: typeof flights = [];
    if (group.length > 0) {
        uniqueGroup.push(group[0]);
        for (let i = 1; i < group.length; i++) {
            const current = group[i];
            const prev = uniqueGroup[uniqueGroup.length - 1];
            const isSameTime = new Date(current.sta).getTime() === new Date(prev.sta).getTime();
            const isSameDirection = current.direction === prev.direction;
            if (isSameTime && isSameDirection) continue;
            uniqueGroup.push(current);
        }
    }
    
    let pendingArrival = null;
    for (const flight of uniqueGroup) {
      if (flight.direction === 'arrival') {
        if (pendingArrival) turnarounds.push(createTurnaroundFromLegs(pendingArrival, null));
        pendingArrival = flight;
      } else if (flight.direction === 'departure') {
        if (pendingArrival) {
          const arrTime = new Date(pendingArrival.sta).getTime();
          const depTime = new Date(flight.sta).getTime();
          if (depTime > arrTime && (depTime - arrTime) < 18 * 3600 * 1000) {
            turnarounds.push(createTurnaroundFromLegs(pendingArrival, flight));
            pendingArrival = null;
          } else {
            turnarounds.push(createTurnaroundFromLegs(pendingArrival, null));
            turnarounds.push(createTurnaroundFromLegs(null, flight));
            pendingArrival = null;
          }
        } else {
          turnarounds.push(createTurnaroundFromLegs(null, flight));
        }
      } else {
          turnarounds.push(createTurnaroundFromLegs(null, flight));
      }
    }
    if (pendingArrival) turnarounds.push(createTurnaroundFromLegs(pendingArrival, null));
  });

  const singlesGrouped: Record<string, typeof flights> = {};
  singles.forEach(f => {
      const route = f.direction === 'arrival' ? f.origin : f.destination;
      const key = `${f.direction}_${new Date(f.sta).getTime()}_${route}`;
      if (!singlesGrouped[key]) singlesGrouped[key] = [];
      singlesGrouped[key].push(f);
  });

  Object.values(singlesGrouped).forEach(group => {
      group.sort((a, b) => {
        const getCodeShareScore = (f: any) => (f.codeShareStatus === 'P' ? 10 : 5);
        const csScoreDiff = getCodeShareScore(b) - getCodeShareScore(a);
        if (csScoreDiff !== 0) return csScoreDiff;
        const scoreDiff = getAirlineScore(b) - getAirlineScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return a.flightNumber.localeCompare(b.flightNumber);
      });
      const main = group[0];
      if(main.direction === 'arrival') turnarounds.push(createTurnaroundFromLegs(main, null));
      else turnarounds.push(createTurnaroundFromLegs(null, main));
  });

  return turnarounds;
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
      const credentials = {
        appId: '611493d7',
        appKey: '95dfba6653326fc95668485c808516ad'
      };
      const filters = {}; 

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
            return;
        }
      } catch (apiError) {
        setIsApiOnline(false);
        console.log("Failed to load from backend API.", apiError);
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


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
      // 1. Generate generic teams based on shifts
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

      // Update Date to matched Plan Date
      if (planDateKey && planDateKey !== selectedDate) {
          setSelectedDate(planDateKey);
      }
      const targetDate = planDateKey || selectedDate;

      // Update Teams State first
      setTeams(newTeams);
      setCustomRoster(new Map()); 
      setPinnedAssignments({});
      setUnassignedStatus(new Set());
      setAssignments({}); // Clear assignments initially

      alert(`Applied optimal plan: Created ${newTeams.length} teams for ${targetDate}. Click 'Auto-Assign Crew' to distribute flights.`);
      setView('schedule');
  }, [selectedDate]);

  // --- REBUILT: LOAD BALANCING / FAIR DISTRIBUTION ALGORITHM ---
  const handleAutoAssign = useCallback(() => {
    setIsAssigning(true);
    
    setTimeout(() => {
        // --- 1. SETUP ---
        const BUFFER_MS = 10 * 60 * 1000; // 10 minutes buffer
        const MAX_SHIFT_MS = 13 * 60 * 60 * 1000; // 13 Hours safety limit (though planner makes 9h shifts)

        // Clone assignments
        const finalAssignments: Assignments = JSON.parse(JSON.stringify(assignments));
        
        // Helper
        const isLegOnDate = (timeStr: string | undefined) => {
            if (!timeStr) return false;
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return false;
            return getDateKey(d) === selectedDate;
        };

        // Clear existing non-pinned assignments for today
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

        // --- 2. PREPARE TEAMS & TRACK LOAD ---
        // Initialize state to track assigned jobs per team
        const teamStates: Record<string, SimulationTeamState> = {};
        teams.forEach(t => {
            teamStates[t.id] = { id: t.id, assignedJobs: [], jobCount: 0 };
        });

        // Pre-fill with pinned assignments
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

        // --- 3. GATHER TASKS ---
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

            // Arrival
            if (isLegOnDate(t.arrival.sta) && !pinnedAssignments[t.id]?.arrival && !isCancelled(t.arrivalRemarks)) {
                const w = getServiceWindow(t, 'arrival');
                if (w) tasks.push({ id: `${t.id}-A`, turnaroundId: t.id, type: 'arrival', start: w[0], end: w[1], turnaround: t });
            }
            // Departure
            if (isLegOnDate(t.departure.std) && !pinnedAssignments[t.id]?.departure && !isCancelled(t.departureRemarks)) {
                const w = getServiceWindow(t, 'departure');
                if (w) tasks.push({ id: `${t.id}-D`, turnaroundId: t.id, type: 'departure', start: w[0], end: w[1], turnaround: t });
            }
        });

        // SEPARATE DEPARTURES AND ARRIVALS
        // To "Secure Outbounds First", we will assign all departures in the first pass.
        // But for each flight, we will pick the *least loaded* crew available.
        const departureTasks = tasks.filter(t => t.type === 'departure').sort((a,b) => a.start - b.start);
        const arrivalTasks = tasks.filter(t => t.type === 'arrival').sort((a,b) => a.start - b.start);

        // --- 4. ASSIGNMENT HELPER (LOAD BALANCED) ---
        const assignBatch = (batchTasks: Task[]) => {
            for (const task of batchTasks) {
                const availableCandidates: Team[] = [];

                // Find all possible teams for this task
                for (const team of teams) {
                    const ts = teamStates[team.id];

                    // Check Shift Time Validity
                    // Shift hours are 0-24. Task start/end are timestamps.
                    const taskDate = new Date(task.start);
                    const shiftStartH = team.shiftStartHour;
                    const shiftEndH = team.shiftEndHour;
                    
                    const taskStartH = taskDate.getHours() + taskDate.getMinutes()/60;
                    // Handle overnight shifts simply for this simulation
                    // If shift is 04:00 - 13:00, and task is 05:00, good.
                    // If task is 14:00, bad.
                    if (taskStartH < shiftStartH || taskStartH > shiftEndH) continue; 

                    // Constraint Checks
                    if (team.members.length < task.turnaround.requiredTeamSize) continue;
                    
                    // Overlap Check
                    const hasOverlap = ts.assignedJobs.some(j => (task.start < j.end) && (task.end > j.start));
                    if (hasOverlap) continue;

                    // Buffer Check (10 mins)
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
                    // SORT BY WORKLOAD (Fairness)
                    // 1. Least number of jobs
                    // 2. If tie, prefer lower ID (stability)
                    availableCandidates.sort((a, b) => {
                        const loadA = teamStates[a.id].jobCount;
                        const loadB = teamStates[b.id].jobCount;
                        if (loadA !== loadB) return loadA - loadB;
                        
                        // Tie-breaker: Randomize or sequential?
                        // Using ID ensures deterministic behavior, but adding a bit of rotation helps fairness in small samples.
                        // Let's stick to ID for stability in UI.
                        return a.id.localeCompare(b.id);
                    });

                    // Pick the best candidate (least loaded)
                    const chosenTeam = availableCandidates[0];
                    const ts = teamStates[chosenTeam.id];

                    if (!finalAssignments[task.turnaroundId]) finalAssignments[task.turnaroundId] = {};
                    finalAssignments[task.turnaroundId][task.type] = chosenTeam.id;
                    ts.assignedJobs.push({ start: task.start, end: task.end });
                    ts.jobCount++;
                }
            }
        };

        // --- 5. EXECUTE TWO-PASS ASSIGNMENT ---
        // Pass 1: Secure Outbounds (Departures) using Load Balancing
        assignBatch(departureTasks);

        // Pass 2: Fill Arrivals using Load Balancing
        assignBatch(arrivalTasks);

        // --- 6. UPDATE ROSTER TIMES & STATE ---
        // Just update assignments, don't change shift times here (Planner handles shift times now)
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Header */}
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
                <p className="text-[10px] text-teal-100 font-medium tracking-wide opacity-80">GROUND OPERATIONS MANAGER</p>
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

      {/* Main Content */}
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
                         if (getDateKey(date) !== selectedDate) return null; // Filter timeline by date
                         
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