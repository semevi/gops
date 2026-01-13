import React, { useEffect, useCallback } from 'react';
import type { Team } from '../types';
import { Skill } from '../types';

interface CrewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
}

const getSkillBadgeClass = (skill: Skill) => {
    switch (skill) {
        case Skill.LEADER:
            return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200';
        case Skill.HEADSET:
            return 'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-200';
        case Skill.DRIVER:
            return 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200';
        case Skill.LOADER:
            return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200';
        default:
            return 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200';
    }
};

export const CrewListModal: React.FC<CrewListModalProps> = ({ isOpen, onClose, teams }) => {
  const allMembers = teams
    .flatMap(team => team.members)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const uniqueMembers = allMembers.filter((member, index, self) =>
    index === self.findIndex((m) => m.name === member.name && m.skill === member.skill)
  );
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crew-list-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full m-4 max-h-[80vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
          <h2 id="crew-list-title" className="text-lg font-semibold text-slate-800">All Crew Members</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500"
            aria-label="Close crew members list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <ul className="space-y-2">
            {uniqueMembers.map(member => (
              <li key={member.name + member.skill} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="font-medium text-slate-700">{member.name}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSkillBadgeClass(member.skill)}`}>
                  {member.skill}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};