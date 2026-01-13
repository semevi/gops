

import type { CrewMember, CustomRoster, CustomShift } from '../types';

type ShiftPattern = {
    name: string;
    cycleLength: number;
    workDays: number[];
    shiftType: 'Early' | 'Late' | 'On';
    startTimeRange: [number, number]; // [minHour, maxHour]
    duration: number; // in hours
};

const AIDAN_BURKE_ROSTER = {
    cycleLength: 11,
    shifts: new Map<number, { start: number; duration: number }>([
        [0, { start: 4, duration: 8 }],
        [1, { start: 5, duration: 8 }],
        [2, { start: 6, duration: 8 }],
        // 3 is off
        [4, { start: 11, duration: 8 }],
        [5, { start: 9, duration: 8 }],
        // 6 is off
        [7, { start: 8, duration: 8 }],
        // 8 is off
        [9, { start: 15, duration: 8 }],
        [10, { start: 5, duration: 8 }],
    ]),
};

const SPLIT_OFF_PATTERNS: ShiftPattern[] = [
    { name: '4 Early / 2 Off Split', cycleLength: 6, workDays: [0, 1, 3, 4], shiftType: 'Early', startTimeRange: [4, 7], duration: 8 },
    { name: '4 Late / 2 Off Split', cycleLength: 6, workDays: [0, 1, 3, 4], shiftType: 'Late', startTimeRange: [13, 16], duration: 8 },
    { name: '5 On / 2 Off Split', cycleLength: 7, workDays: [0, 1, 2, 4, 5], shiftType: 'On', startTimeRange: [8, 11], duration: 8 },
];

const CONSECUTIVE_OFF_PATTERNS: ShiftPattern[] = [
    { name: '4 Early / 2 Off Consecutive', cycleLength: 6, workDays: [0, 1, 2, 3], shiftType: 'Early', startTimeRange: [4, 7], duration: 8 },
    { name: '4 Late / 2 Off Consecutive', cycleLength: 6, workDays: [0, 1, 2, 3], shiftType: 'Late', startTimeRange: [13, 16], duration: 8 },
    { name: '5 On / 2 Off Consecutive', cycleLength: 7, workDays: [0, 1, 2, 3, 4], shiftType: 'On', startTimeRange: [8, 11], duration: 8 },
];

const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash);
};

export const generateRosterForMemberForMonth = (
    member: CrewMember,
    dateInMonth: Date,
    customRoster: CustomRoster,
): Map<string, CustomShift> => {
    
    const rosterMap = new Map<string, CustomShift>();
    if (!member) return rosterMap;

    const referenceDate = new Date('2024-01-01');
    const firstDayOfMonth = new Date(dateInMonth.getFullYear(), dateInMonth.getMonth(), 1);
    const memberCustomShifts = customRoster.get(member.name);

    // Generate for all days in the month
    for (let d = 1; d <= 42; d++) { // Check enough days to cover edge cases for month view
        const day = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), d);
        const dateKey = day.toISOString().split('T')[0];

        // 1. Prioritize custom roster
        if (memberCustomShifts && memberCustomShifts.has(dateKey)) {
            rosterMap.set(dateKey, memberCustomShifts.get(dateKey)!);
            continue;
        }

        // 2. Fallback to generated roster
        const diffTime = day.getTime() - referenceDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (member.name === 'Aidan Burke') {
            const dayInCycle = diffDays % AIDAN_BURKE_ROSTER.cycleLength;
            if (AIDAN_BURKE_ROSTER.shifts.has(dayInCycle)) {
                const shiftInfo = AIDAN_BURKE_ROSTER.shifts.get(dayInCycle)!;
                const startHour = shiftInfo.start;
                const endHour = startHour + shiftInfo.duration;
                const startDate = new Date(day); startDate.setHours(startHour, 0, 0, 0);
                const endDate = new Date(day); endDate.setHours(endHour, 0, 0, 0);
                rosterMap.set(dateKey, { type: 'On', start: startDate.toISOString(), end: endDate.toISOString() });
            }
            continue;
        }
        
        const memberHash = simpleHash(member.name);
        const isOnPermanentPattern = (memberHash % 2) === 0;

        if (isOnPermanentPattern) {
            const permanentPatternGroup = memberHash % 3;
            const dayOffset = permanentPatternGroup * 4;
            const dayInCycle = (diffDays - dayOffset + 12) % 12;

            let shiftDetails: { type: string; range: [number, number]; duration: number } | null = null;
            if (dayInCycle >= 0 && dayInCycle <= 3) {
                shiftDetails = { type: 'Early', range: [4, 10], duration: 8 };
            } else if (dayInCycle >= 6 && dayInCycle <= 9) {
                shiftDetails = { type: 'Late', range: [11, 17], duration: 8 };
            }

            if (shiftDetails) {
                const dayHash = simpleHash(`${member.name}-${dateKey}`);
                const [min, max] = shiftDetails.range;
                const startHour = min + (dayHash % (max - min + 1));
                const endHour = startHour + shiftDetails.duration;
                const startDate = new Date(day); startDate.setHours(startHour, 0, 0, 0);
                const endDate = new Date(day); endDate.setHours(endHour, 0, 0, 0);
                if (endHour >= 24) endDate.setDate(endDate.getDate() + 1);
                rosterMap.set(dateKey, { type: shiftDetails.type, start: startDate.toISOString(), end: endDate.toISOString() });
            }
        } else {
            const patternIndex = memberHash % SPLIT_OFF_PATTERNS.length;
            const consecutiveOffWeek = (memberHash >> 8) % 4;
            const weekInMonthCycle = Math.floor((diffDays % 28) / 7);

            const pattern = weekInMonthCycle === consecutiveOffWeek
                ? CONSECUTIVE_OFF_PATTERNS[patternIndex]
                : SPLIT_OFF_PATTERNS[patternIndex];

            const dayInCycle = diffDays % pattern.cycleLength;
            if (pattern.workDays.includes(dayInCycle)) {
                const dayHash = simpleHash(`${member.name}-${dateKey}`);
                const [min, max] = pattern.startTimeRange;
                const startHour = min + (dayHash % (max - min + 1));
                const endHour = startHour + pattern.duration;
                const startDate = new Date(day); startDate.setHours(startHour, 0, 0, 0);
                const endDate = new Date(day); endDate.setHours(endHour, 0, 0, 0);
                if (endHour >= 24) endDate.setDate(endDate.getDate() + 1);
                rosterMap.set(dateKey, { type: pattern.shiftType, start: startDate.toISOString(), end: endDate.toISOString() });
            }
        }
    }
    return rosterMap;
};