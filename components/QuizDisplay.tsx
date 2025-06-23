import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { QuizItem } from './QuizItem';

interface QuizDisplayProps {
  questions: QuizQuestion[];
}

export const QuizDisplay: React.FC<QuizDisplayProps> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (submitted) return; // Don't allow changes after submission
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const calculateScore = () => {
    if (!submitted) return 0;
    return questions.reduce((score, question, index) => {
      if (userAnswers[index] === question.correctAnswerIndex) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  if (!questions || questions.length === 0) {
    return <p className="text-center text-slate-400">No quiz questions available.</p>;
  }

  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <QuizItem
          key={index}
          questionIndex={index}
          questionData={question}
          selectedAnswer={userAnswers[index] ?? null}
          onAnswerSelect={handleAnswerSelect}
          submitted={submitted}
        />
      ))}
      
      {!submitted && (
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
        >
          Submit Quiz & See Results
        </button>
      )}

      {submitted && (
        <div className="mt-8 p-6 bg-slate-700 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-sky-400 mb-4 text-center">Quiz Results</h3>
          <p className="text-xl text-center text-slate-200">
            You scored: <strong className="text-emerald-400">{calculateScore()}</strong> out of <strong className="text-emerald-400">{questions.length}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
