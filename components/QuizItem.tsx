import React from 'react';
import { QuizQuestion } from '../types';

interface QuizItemProps {
  questionIndex: number;
  questionData: QuizQuestion;
  selectedAnswer: number | null;
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  submitted: boolean;
}

export const QuizItem: React.FC<QuizItemProps> = ({
  questionIndex,
  questionData,
  selectedAnswer,
  onAnswerSelect,
  submitted,
}) => {
  const { question, options, correctAnswerIndex, explanation } = questionData;

  const getOptionClasses = (optionIndex: number): string => {
    let baseClasses = "block w-full text-left p-3 my-2 rounded-md border transition-all duration-150 ease-in-out";
    if (submitted) {
      if (optionIndex === correctAnswerIndex) {
        baseClasses += " bg-emerald-700 border-emerald-500 text-white"; // Correct answer
      } else if (optionIndex === selectedAnswer) {
        baseClasses += " bg-red-700 border-red-500 text-white"; // Incorrectly selected answer
      } else {
        baseClasses += " bg-slate-600 border-slate-500 text-slate-300 opacity-70"; // Not selected, not correct
      }
    } else {
      if (optionIndex === selectedAnswer) {
        baseClasses += " bg-sky-600 border-sky-500 text-white"; // Selected by user
      } else {
        baseClasses += " bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-sky-500 text-slate-200"; // Default
      }
    }
    return baseClasses;
  };

  return (
    <div className="p-5 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
      <p className="text-lg font-semibold text-slate-100 mb-4">
        <span className="text-sky-400 mr-2">Q{questionIndex + 1}:</span> {question}
      </p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(questionIndex, index)}
            disabled={submitted}
            className={`${getOptionClasses(index)} ${!submitted ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span className={`font-medium mr-2 ${submitted && optionIndex === correctAnswerIndex ? 'text-white' : submitted && optionIndex !== correctAnswerIndex && optionIndex === selectedAnswer ? 'text-white' : submitted ? 'text-slate-300' : 'text-sky-400'}`}>
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>
      {submitted && explanation && (
        <div className="mt-4 p-3 bg-slate-700/50 border border-slate-600 rounded-md text-sm text-slate-300">
          <p><strong className="text-sky-400">Explanation:</strong> {explanation}</p>
        </div>
      )}
    </div>
  );
};
