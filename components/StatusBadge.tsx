import React from 'react';
import { FlightStatus } from '../types';

interface StatusBadgeProps {
  status: FlightStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case FlightStatus.OnTime:
      case FlightStatus.Arrived:
      case FlightStatus.Departed:
      case FlightStatus.Scheduled:
        return 'bg-green-100 text-green-800';
      case FlightStatus.Delayed:
        return 'bg-yellow-100 text-yellow-800';
      case FlightStatus.Boarding:
        return 'bg-blue-100 text-blue-800';
      case FlightStatus.GroundService:
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-semibold rounded-full ${getStatusColor()}`}
    >
      {status}
    </span>
  );
};