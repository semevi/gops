import React, { useState, useMemo } from 'react';
import type { Team, CustomRoster, CustomShift } from '../types';
import { generateRosterForMemberForMonth } from '../utils/roster';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ActionIcons';

interface RosterPageProps {
  teams: Team[];
  customRoster: CustomRoster;
}

type RosterData = Map<string, CustomShift>;

const getShiftColor = (shiftType?: string): string => {
    switch (shiftType?.toLowerCase()) {
        case 'early': return 'bg-teal-100 text-teal-800 border-teal-200';
        case 'late': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'on': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'off': return 'bg-slate-50 text-slate-400';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
};

const formatHour = (isoString: string) => new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const RosterPage: React.FC<RosterPageProps> = ({ teams, customRoster }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const { daysInMonth, memberRosters } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = new Date(year, month + 1, 0).getDate();
        
        const days = Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1));
        
        const rosters = new Map<string, RosterData>();
        teams.forEach(team => {
            team.members.forEach(member => {
                rosters.set(member.name, generateRosterForMemberForMonth(member, currentDate, customRoster));
            });
        });

        return { daysInMonth: days, memberRosters: rosters };
    }, [currentDate, teams, customRoster]);

    const groups = useMemo(() => {
        const groupData: Record<string, Team[]> = {
            'Orange Group': [],
            'Green Group': [],
            'White Group': [],
            'Grey Group': []
        };

        const sortedTeams = [...teams].sort((a, b) => {
            const numA = parseInt(a.name.replace(/[^0-9]/g, ''), 10) || 0;
            const numB = parseInt(b.name.replace(/[^0-9]/g, ''), 10) || 0;
            return numA - numB;
        });

        sortedTeams.forEach((team, index) => {
            const mod = index % 4;
            if (mod === 0) groupData['Orange Group'].push(team);
            else if (mod === 1) groupData['Green Group'].push(team);
            else if (mod === 2) groupData['White Group'].push(team);
            else groupData['Grey Group'].push(team);
        });

        return groupData;
    }, [teams]);

    const monthAndYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isToday = (date: Date) => 
        date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear();

    const getGroupHeaderStyles = (groupName: string) => {
        switch(groupName) {
            case 'Orange Group': return 'bg-orange-500 text-white';
            case 'Green Group': return 'bg-[#00624D] text-white'; // Updated to Corporate Green
            case 'White Group': return 'bg-white text-slate-800 border-y-2 border-slate-200';
            case 'Grey Group': return 'bg-slate-500 text-white';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-slate-800">Monthly Crew Roster</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 text-slate-500" aria-label="Previous month">
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <span className="w-32 text-center text-sm font-semibold text-slate-700">{monthAndYear}</span>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 text-slate-500" aria-label="Next month">
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="text-[10px] text-slate-500 bg-slate-50">
                        <tr>
                            <th className="sticky left-0 bg-slate-50 border-r border-b border-slate-200 p-2 w-48 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                Crew Member
                            </th>
                            {daysInMonth.map(day => (
                                <th key={day.toISOString()} className={`border-b border-slate-200 p-2 min-w-[5rem] ${isToday(day) ? 'bg-teal-100' : ''}`}>
                                    <div className="font-semibold">{day.toLocaleString('default', { weekday: 'short' })}</div>
                                    <div>{day.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {Object.entries(groups).map(([groupName, groupTeams]) => {
                            // Collect all members from all teams in this group and flatten them into a single list
                            const groupMembers = (groupTeams as Team[])
                                .flatMap(team => team.members)
                                .sort((a, b) => a.name.localeCompare(b.name));
                            
                            if (groupMembers.length === 0) return null;

                            return (
                                <React.Fragment key={groupName}>
                                    {/* Group Header */}
                                    <tr>
                                        <td 
                                            className={`sticky left-0 border-b border-r border-slate-200 p-3 font-bold text-sm z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${getGroupHeaderStyles(groupName)}`}
                                        >
                                            {groupName}
                                        </td>
                                        <td colSpan={daysInMonth.length} className={`border-b border-slate-200 ${getGroupHeaderStyles(groupName)} opacity-50`}>
                                        </td>
                                    </tr>

                                    {/* List all members in this group directly, without Team headers */}
                                    {groupMembers.map(member => {
                                        const roster = memberRosters.get(member.name);
                                        return (
                                            <tr key={member.name} className="hover:bg-slate-50 transition-colors">
                                                <td className="sticky left-0 bg-white hover:bg-slate-50 border-r border-b border-slate-200 p-2 font-medium text-slate-800 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] pl-4">
                                                    {member.name}
                                                </td>
                                                {daysInMonth.map(day => {
                                                    const dateKey = day.toISOString().split('T')[0];
                                                    const shift = roster?.get(dateKey);
                                                    const shiftType = shift ? shift.type : 'Off';
                                                    
                                                    return (
                                                        <td key={dateKey} className={`border-b border-slate-200 text-center p-1 ${getShiftColor(shiftType)} ${isToday(day) ? 'brightness-95' : ''}`}>
                                                            {shift ? (
                                                                <div className="text-[9px] font-bold">
                                                                    <p>{shift.type}</p>
                                                                    <p className="font-mono text-[8px] opacity-80">{formatHour(shift.start)}-{formatHour(shift.end)}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};