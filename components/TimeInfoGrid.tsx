import React from 'react';
import type { FlightInfo } from '../types';
import { TimeBadge } from './TimeBadge';

interface TimeInfoGridProps {
    flightInfo: Partial<FlightInfo>;
    type: 'arrival' | 'departure';
}

const TimeInfoCell: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center gap-2 justify-start">
        <p className="font-semibold text-slate-500 w-9 text-right">{label}</p>
        {children}
    </div>
);

export const TimeInfoGrid: React.FC<TimeInfoGridProps> = ({ flightInfo, type }) => {
    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-x-3 gap-y-1.5 text-xs">
            <TimeInfoCell label="SCH">
                <TimeBadge time={type === 'arrival' ? flightInfo.sta : flightInfo.std} type="scheduled" />
            </TimeInfoCell>
            <TimeInfoCell label="EST">
                <TimeBadge time={type === 'arrival' ? flightInfo.eta : flightInfo.etd} type="estimated" />
            </TimeInfoCell>
            <TimeInfoCell label="SLOT">
                <TimeBadge time={flightInfo.slot} type="slot" />
            </TimeInfoCell>
            <TimeInfoCell label="ACT">
                <TimeBadge time={type === 'arrival' ? flightInfo.ata : flightInfo.atd} type="actual" />
            </TimeInfoCell>
        </div>
    );
};