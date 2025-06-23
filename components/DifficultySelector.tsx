import React from 'react';
import { DifficultyLevel } from '../types';
import { DIFFICULTIES } from '../constants';

interface DifficultySelectorProps {
  currentDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  disabled: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ currentDifficulty, onDifficultyChange, disabled }) => {
  return (
    <div className="relative">
      <select
        id="difficulty-selector"
        value={currentDifficulty}
        onChange={(e) => onDifficultyChange(e.target.value as DifficultyLevel)}
        disabled={disabled}
        className="w-full appearance-none bg-slate-700 border border-slate-600 text-slate-100 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-slate-600 focus:border-sky-500 shadow-sm transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {DIFFICULTIES.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-700 text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};
