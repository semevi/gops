import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Flight, Team, CrewMember } from '../types';
import { Skill } from '../types';
import { SearchIcon } from './icons/ActionIcons';

interface TimelineViewProps {
  flights: Flight[];
  teams: Team[];
  assignments: Record<string, string>;
  onMoveCrewMember: (memberName: string, sourceTeamId: string, destinationTeamId: string) => void;
  onSwapCrewMembers: (draggedMemberName: string, sourceTeamId: string, targetMemberName: string, destinationTeamId: string) => void;
}

const getSkillBadgeClass = (skill: Skill) => {
    switch (skill) {
        case Skill.LEADER:
            return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200 hover:bg-red-200';
        case Skill.HEADSET:
            return 'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-200 hover:bg-orange-200';
        case Skill.DRIVER:
            return 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200 hover:bg-yellow-200';
        case Skill.LOADER:
            return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200 hover:bg-green-200';
        default:
            return 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200 hover:bg-slate-200';
    }
};

export const TimelineView: React.FC<TimelineViewProps> = ({ flights, teams, assignments, onMoveCrewMember, onSwapCrewMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggingOverTeamId, setDraggingOverTeamId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<{ teamId: string, memberName: string } | null>(null);
  const [editingEmptySlot, setEditingEmptySlot] = useState<{ teamId: string, slotIndex: number } | null>(null);
  const [editSearch, setEditSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allMembersWithTeamId = useMemo(() =>
    teams.flatMap(team =>
      team.members.map(member => ({ ...member, teamId: team.id }))
    ), [teams]);

  useEffect(() => {
    if ((editingMember || editingEmptySlot) && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingMember, editingEmptySlot]);

  const getMinutesFromISODate = (iso: string) => {
      const date = new Date(iso);
      if (isNaN(date.getTime())) {
          return 0;
      }
      return date.getHours() * 60 + date.getMinutes();
  }
  
  const sortedTeams = [...teams].sort((a, b) => {
    const numA = parseInt(a.name.replace('Crew ', ''), 10);
    const numB = parseInt(b.name.replace('Crew ', ''), 10);
    return numA - numB;
  });
  
  const filteredTeams = sortedTeams.filter(team => {
      if (searchTerm.trim() === '') return true;
      const lowerSearchTerm = searchTerm.toLowerCase();
      const teamNameMatch = team.name.toLowerCase().includes(lowerSearchTerm);
      const memberNameMatch = team.members.some(m => m.name.toLowerCase().includes(lowerSearchTerm));
      return teamNameMatch || memberNameMatch;
  });

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, memberName: string, sourceTeamId: string) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ memberName, sourceTeamId }));
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>, teamId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingOverTeamId(teamId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!e.currentTarget.contains(relatedTarget)) {
        setDraggingOverTeamId(null);
      }
  };
  
  const handleDropOnMember = (e: React.DragEvent<HTMLButtonElement>, targetMemberName: string, destinationTeamId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingOverTeamId(null);
      try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          const { memberName, sourceTeamId } = data;
          if (memberName && sourceTeamId && destinationTeamId && memberName !== targetMemberName) {
            onSwapCrewMembers(memberName, sourceTeamId, targetMemberName, destinationTeamId);
          }
      } catch (error) {
          console.error("Failed to parse drag data", error);
      }
  };
  
  const handleDropOnEmptySlot = (e: React.DragEvent<HTMLDivElement>, destinationTeamId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingOverTeamId(null);
      try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          const { memberName, sourceTeamId } = data;
          if (memberName && sourceTeamId && destinationTeamId) {
              onMoveCrewMember(memberName, sourceTeamId, destinationTeamId);
          }
      } catch (error) {
          console.error("Failed to parse drag data", error);
      }
  };

  const filteredSuggestions = useMemo(() => {
    if (!editingMember && !editingEmptySlot) return [];
    const lowerSearch = editSearch.toLowerCase();
    return allMembersWithTeamId.filter(m =>
        m.name.toLowerCase().includes(lowerSearch) &&
        (!editingMember || m.name !== editingMember.memberName)
    ).slice(0, 5); // Limit suggestions
  }, [editSearch, editingMember, editingEmptySlot, allMembersWithTeamId]);
  
  const handleSelectSuggestion = (suggestedMember: CrewMember & {teamId: string}) => {
    if (editingMember) {
        const draggedMemberName = suggestedMember.name;
        const sourceTeamId = suggestedMember.teamId;
        const targetMemberName = editingMember.memberName;
        const destinationTeamId = editingMember.teamId;
        
        if (draggedMemberName !== targetMemberName || sourceTeamId !== destinationTeamId) {
            onSwapCrewMembers(draggedMemberName, sourceTeamId, targetMemberName, destinationTeamId);
        }
    } else if (editingEmptySlot) {
        const memberName = suggestedMember.name;
        const sourceTeamId = suggestedMember.teamId;
        const destinationTeamId = editingEmptySlot.teamId;
        onMoveCrewMember(memberName, sourceTeamId, destinationTeamId);
    }

    setEditingMember(null);
    setEditingEmptySlot(null);
    setEditSearch('');
  };


  const formatTime = (hour: number): string => {
    const h = Math.floor(hour % 24);
    const m = Math.round((hour - Math.floor(hour)) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  
  const formatMinutes = (minutes: number) => {
    const h = Math.floor((minutes / 60) % 24);
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4 bg-slate-50">
      <div className="sticky top-[4rem] z-10 bg-slate-50/80 backdrop-blur-sm pt-2 pb-4">
          <div className="relative max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                  type="text"
                  placeholder="Find crew member or team..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-slate-300 pl-9 shadow-sm focus:border-[#00624D] focus:ring-[#00624D] sm:text-xs h-8"
                  aria-label="Search for crew or team"
              />
          </div>
      </div>

      {filteredTeams.map(team => {
        const assignedFlights = Object.entries(assignments)
          .filter(([_, teamId]) => teamId === team.id)
          .map(([flightId, _]) => flights.find(f => f.id === flightId))
          .filter((f): f is Flight => f !== null && f !== undefined);
        
        const scheduleItems = [
          ...assignedFlights.map(flight => {
            const serviceRefTime = flight.isArrival ? flight.sta : flight.std;
            let startMinutes = getMinutesFromISODate(serviceRefTime);
            if (!flight.isArrival) {
              startMinutes -= flight.serviceDurationMinutes;
            }
            const endMinutes = startMinutes + flight.serviceDurationMinutes;
            return { type: 'flight' as const, startMinutes, endMinutes, data: flight };
          })
        ];

        scheduleItems.sort((a, b) => a.startMinutes - b.startMinutes);
        
        const isDropTarget = draggingOverTeamId === team.id;

        return (
          <div 
            key={team.id} 
            className={`flex bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 ${isDropTarget ? 'ring-2 ring-[#00624D] scale-[1.01]' : ''}`}
            onDragLeave={handleDragLeave}
            onDragEnter={(e) => handleDragEnter(e, team.id)}
          >
            <div className="w-80 flex-shrink-0 flex flex-col self-stretch border-r border-slate-200 px-4 py-3">
              <p className="font-bold text-sm text-slate-800" title={`${team.name} (${formatTime(team.shiftStartHour)} - ${formatTime(team.shiftEndHour)})`}>{team.name} ({formatTime(team.shiftStartHour)} - {formatTime(team.shiftEndHour)})</p>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {Array.from({ length: 4 }).map((_, index) => {
                      const member = team.members[index];
                      if (member) {
                          const isHighlighted = searchTerm.trim() !== '' && member.name.toLowerCase().includes(searchTerm.toLowerCase());
                          const isEditing = editingMember?.teamId === team.id && editingMember?.memberName === member.name;
                          
                          if (isEditing) {
                            return (
                                <div key={member.name} className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={editSearch}
                                        onChange={e => setEditSearch(e.target.value)}
                                        onBlur={() => { setEditingMember(null); setEditSearch(''); }}
                                        onKeyDown={e => { if (e.key === 'Escape') { setEditingMember(null); setEditSearch(''); } }}
                                        className="w-full px-2 py-1 text-xs rounded-md bg-white border border-[#00624D] ring-2 ring-teal-200 text-center flex flex-col items-center justify-center min-h-[40px] focus:outline-none"
                                    />
                                    {filteredSuggestions.length > 0 && (
                                        <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {filteredSuggestions.map(suggestion => (
                                                <li 
                                                    key={suggestion.name} 
                                                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                                                    className="px-3 py-2 text-[11px] text-slate-700 hover:bg-teal-50 cursor-pointer"
                                                >
                                                    {suggestion.name} <span className="text-slate-400">({teams.find(t=>t.id === suggestion.teamId)?.name})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                          }

                          return (
                              <button
                                  key={member.name} 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, member.name, team.id)}
                                  onDrop={(e) => handleDropOnMember(e, member.name, team.id)}
                                  onDragOver={handleDragOver}
                                  onDoubleClick={() => {
                                      setEditingMember({ teamId: team.id, memberName: member.name });
                                      setEditSearch(member.name);
                                  }}
                                  className={`w-full px-2 py-1 text-[11px] rounded-md ${getSkillBadgeClass(member.skill)} text-center flex flex-col items-center justify-center min-h-[40px] transition-all duration-200 cursor-grab active:cursor-grabbing ${isHighlighted ? 'ring-2 ring-offset-1 ring-yellow-400' : ''}`}
                                  title={`${member.name} - ${member.skill} (double-click to edit, drag to move)`}
                              >
                                  <span className="font-bold block truncate w-full">{member.name}</span>
                                  <span className="font-normal block">{member.skill}</span>
                              </button>
                          );
                      } else {
                           const isEditingEmpty = editingEmptySlot?.teamId === team.id && editingEmptySlot?.slotIndex === index;
                           if (isEditingEmpty) {
                                return (
                                    <div key={`editing-empty-${index}`} className="relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editSearch}
                                            placeholder="Find member..."
                                            onChange={e => setEditSearch(e.target.value)}
                                            onBlur={() => { setEditingEmptySlot(null); setEditSearch(''); }}
                                            onKeyDown={e => { if (e.key === 'Escape') { setEditingEmptySlot(null); setEditSearch(''); } }}
                                            className="w-full px-2 py-1 text-xs rounded-md bg-white border border-[#00624D] ring-2 ring-teal-200 text-center flex flex-col items-center justify-center min-h-[40px] focus:outline-none"
                                        />
                                        {filteredSuggestions.length > 0 && (
                                            <ul className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {filteredSuggestions.map(suggestion => (
                                                    <li 
                                                        key={suggestion.name} 
                                                        onMouseDown={() => handleSelectSuggestion(suggestion)}
                                                        className="px-3 py-2 text-[11px] text-slate-700 hover:bg-teal-50 cursor-pointer"
                                                    >
                                                        {suggestion.name} <span className="text-slate-400">({teams.find(t=>t.id === suggestion.teamId)?.name})</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                           }
                          return (
                              <div
                                  key={`placeholder-${index}`}
                                  onDrop={(e) => handleDropOnEmptySlot(e, team.id)}
                                  onDragOver={handleDragOver}
                                  onDoubleClick={() => {
                                      setEditingEmptySlot({ teamId: team.id, slotIndex: index });
                                      setEditSearch('');
                                  }}
                                  className="px-2 py-1 rounded-md bg-slate-100 ring-1 ring-inset ring-slate-200 min-h-[40px] cursor-pointer hover:bg-slate-200 transition-colors"
                                  aria-label="Empty crew slot, double-click to add"
                              >
                                &nbsp;
                              </div>
                          );
                      }
                  })}
              </div>
            </div>
            <div className="flex-grow flex items-center p-3">
                <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px]">
                {scheduleItems.length > 0 ? scheduleItems.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <span className="text-slate-400 font-sans mx-1">→</span>}
                      <li className="flex items-center">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                            {formatMinutes(item.startMinutes)} - {formatMinutes(item.endMinutes)}
                        </span>
                        <span className="ml-2 font-semibold">
                            <>{item.data.flightNumber} <span className="font-normal text-slate-500 text-[10px]">({item.data.isArrival ? 'Arr' : 'Dep'})</span></>
                        </span>
                      </li>
                    </React.Fragment>
                )) : (
                    <li className="text-slate-400 italic text-[11px]">No assignments for this crew.</li>
                )}
                </ul>
            </div>
          </div>
        )
      })}
    </div>
  );
};