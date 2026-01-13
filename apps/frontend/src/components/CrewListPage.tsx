import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CrewMember, Team, CustomRoster } from '../types';
import { Skill } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from './icons/ActionIcons';
import { generateRosterForMemberForMonth } from '../utils/roster';


interface CrewListPageProps {
  teams: Team[];
  onUpdateCrewSkill: (memberName: string, oldSkill: Skill, newSkill: Skill) => void;
  customRoster: CustomRoster;
}

const getSkillBadgeClass = (skill: Skill): string => {
    switch (skill) {
        case Skill.LEADER: return 'bg-red-100 text-red-800 ring-red-200 hover:bg-red-200 active:bg-red-300';
        case Skill.HEADSET: return 'bg-orange-100 text-orange-800 ring-orange-200 hover:bg-orange-200 active:bg-orange-300';
        case Skill.DRIVER: return 'bg-yellow-100 text-yellow-800 ring-yellow-200 hover:bg-yellow-200 active:bg-yellow-300';
        case Skill.LOADER: return 'bg-green-100 text-green-800 ring-green-200 hover:bg-green-200 active:bg-green-300';
        default: return 'bg-slate-100 text-slate-800 ring-slate-200 hover:bg-slate-200 active:bg-slate-300';
    }
};

const skillOrder = [Skill.LEADER, Skill.HEADSET, Skill.DRIVER, Skill.LOADER];

const SkillEditor: React.FC<{
    member: CrewMember;
    onUpdate: (newSkill: Skill) => void;
    onClose: () => void;
}> = ({ member, onUpdate, onClose }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSelect = (newSkill: Skill) => {
        if (member.skill !== newSkill) {
            onUpdate(newSkill);
        }
        onClose();
    };
    
    return (
        <div className="relative" ref={editorRef}>
            {/* Show current skill as a placeholder to maintain layout */}
            <div className={`w-36 invisible flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-md ring-1 ring-inset ${getSkillBadgeClass(member.skill)}`}>
                 <span>{member.skill}</span>
            </div>
            <div className="absolute bottom-0 w-36 bg-white shadow-lg rounded-md border border-slate-200 py-1 z-10" role="listbox">
                {skillOrder.map(skill => (
                    <button
                        key={skill}
                        onClick={() => handleSelect(skill)}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-teal-50 ${member.skill === skill ? 'text-[#00624D] font-bold' : 'text-slate-700'}`}
                        role="option"
                        aria-selected={member.skill === skill}
                    >
                        {skill}
                    </button>
                ))}
            </div>
        </div>
    );
};


interface CalendarProps {
    member: CrewMember;
    customRoster: CustomRoster;
}

const Calendar: React.FC<CalendarProps> = ({ member, customRoster }) => {
    const [today] = useState(new Date());
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const roster = useMemo(() => {
        if (!member) return new Map();
        return generateRosterForMemberForMonth(member, today, customRoster);
    }, [member, today, customRoster]);

    const getShiftColor = (shiftType: string) => {
        switch (shiftType?.toLowerCase()) {
            case 'early': return 'bg-teal-100 text-teal-800';
            case 'late': return 'bg-amber-100 text-amber-800';
            case 'on': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    const formatHour = (isoString: string) => new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startDate = new Date(firstDayOfMonth);
        const dayOfWeek = startDate.getDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(startDate.getDate() - offset);
        
        const days = [];
        for (let i = 0; i < 42; i++) { 
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    }, [today]);

    const monthAndYear = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const isToday = (date: Date) => date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    return (
        <div className="mt-6">
            <h3 className="text-center text-base font-bold text-slate-800 mb-4">{monthAndYear}</h3>
            <div className="grid grid-cols-7 gap-px text-center text-[10px] font-semibold text-slate-500">
                {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px text-xs">
                {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === today.getMonth();
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const dateKey = day.toISOString().split('T')[0];
                    const shift = roster.get(dateKey);

                    return (
                        <div key={index} className={`relative h-16 p-1.5 border border-slate-100 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'} ${isWeekend && isCurrentMonth ? 'bg-slate-50/50' : ''}`}>
                            <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${isToday(day) ? 'bg-[#00624D] text-white font-bold' : ''}`}>
                                {day.getDate()}
                            </span>
                             {shift && (
                                <div className={`absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded-md text-center text-[9px] font-bold ${getShiftColor(shift.type)}`}>
                                    <p>{shift.type}</p>
                                    <p className="font-mono">{formatHour(shift.start)}-{formatHour(shift.end)}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const CrewListPage: React.FC<CrewListPageProps> = ({ teams, onUpdateCrewSkill, customRoster }) => {
    const allMembers = useMemo(() =>
        teams
            .flatMap(team => team.members.map(member => ({ ...member, teamId: team.id })))
            .sort((a, b) => a.name.localeCompare(b.name)),
        [teams]
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [editingMemberName, setEditingMemberName] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const currentMember = allMembers[currentIndex];

    const handlePrev = () => setCurrentIndex(i => (i - 1 + allMembers.length) % allMembers.length);
    const handleNext = () => setCurrentIndex(i => (i + 1) % allMembers.length);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchActive(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMembers = useMemo(() => {
        if (!searchTerm) return [];
        const lowerSearch = searchTerm.toLowerCase();
        return allMembers.filter(m => m.name.toLowerCase().includes(lowerSearch));
    }, [searchTerm, allMembers]);

    const handleSelectSearch = (member: CrewMember) => {
        const memberIndex = allMembers.findIndex(m => m.name === member.name);
        if (memberIndex !== -1) {
            setCurrentIndex(memberIndex);
        }
        setSearchTerm('');
        setIsSearchActive(false);
    };
    
    if (!currentMember) {
        return (
             <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-full flex items-center justify-center">
                <p className="text-slate-500">No crew members found.</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-full">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-slate-800">Crew Members</h1>
                    <div ref={searchRef} className="relative">
                        <button 
                            onClick={() => setIsSearchActive(true)}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            aria-label="Search for a crew member"
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                        {isSearchActive && (
                             <div className="absolute right-0 top-full mt-2 w-72 z-20">
                                 <input
                                     type="text"
                                     value={searchTerm}
                                     onChange={(e) => setSearchTerm(e.target.value)}
                                     placeholder="Find a crew member..."
                                     className="w-full px-4 py-2 text-xs border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00624D]"
                                     autoFocus
                                 />
                                 {filteredMembers.length > 0 && searchTerm && (
                                     <ul className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                         {filteredMembers.map(member => (
                                             <li key={member.name}>
                                                 <button onClick={() => handleSelectSearch(member)} className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-teal-50">
                                                     {member.name}
                                                 </button>
                                             </li>
                                         ))}
                                     </ul>
                                 )}
                             </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                         <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 text-slate-500" aria-label="Previous crew member">
                            <ChevronLeftIcon className="h-6 w-6" />
                         </button>
                         <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-900">{currentMember.name}</h2>
                         </div>
                         <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 text-slate-500" aria-label="Next crew member">
                            <ChevronRightIcon className="h-6 w-6" />
                         </button>
                    </div>

                    <div className="flex justify-center mt-4">
                        {editingMemberName === currentMember.name ? (
                            <SkillEditor
                                member={currentMember}
                                onUpdate={(newSkill) => onUpdateCrewSkill(currentMember.name, currentMember.skill, newSkill)}
                                onClose={() => setEditingMemberName(null)}
                            />
                        ) : (
                            <button
                                onDoubleClick={() => setEditingMemberName(currentMember.name)}
                                className={`w-36 flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-md ring-1 ring-inset transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00624D] ${getSkillBadgeClass(currentMember.skill)}`}
                                title={`Current role: ${currentMember.skill}. Double-click to change.`}
                            >
                                <span>{currentMember.skill}</span>
                            </button>
                        )}
                    </div>
                    
                    <Calendar member={currentMember} customRoster={customRoster} />
                </div>
            </div>
        </div>
    );
};