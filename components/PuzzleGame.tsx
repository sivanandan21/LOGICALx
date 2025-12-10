import React, { useState, useEffect } from 'react';
import { Puzzle } from '../types';
import { Button } from './Button';
import { CheckCircle, XCircle, ArrowRight, Code2, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleGameProps {
  puzzle: Puzzle;
  onComplete: (success: boolean) => void;
  onExit: () => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ puzzle, onComplete, onExit }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when puzzle changes
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
  }, [puzzle]);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    
    const isCorrect = selectedOption === puzzle.correctAnswerIndex;
    
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f43f5e']
      });
    }
  };

  const handleNext = () => {
    const isCorrect = selectedOption === puzzle.correctAnswerIndex;
    onComplete(isCorrect);
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={onExit}>Exit</Button>
        <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${puzzle.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                  puzzle.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                {puzzle.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
                {puzzle.type}
            </span>
        </div>
        <div className="text-primary font-bold">+{puzzle.xpReward} XP</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 pb-20 md:pb-0">
        <div className="bg-surface border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                {puzzle.question}
            </h2>

            {puzzle.codeSnippet && (
                <div className="bg-slate-900 rounded-lg p-4 mb-6 font-mono text-sm text-blue-300 border border-slate-800 overflow-x-auto">
                    <pre>{puzzle.codeSnippet}</pre>
                </div>
            )}

            <div className="space-y-3">
                {puzzle.options.map((option, index) => {
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ";
                    
                    if (isSubmitted) {
                        if (index === puzzle.correctAnswerIndex) {
                            btnClass += "bg-emerald-500/10 border-emerald-500 text-white";
                        } else if (index === selectedOption) {
                            btnClass += "bg-rose-500/10 border-rose-500 text-white";
                        } else {
                            btnClass += "border-slate-700 text-slate-400 opacity-50";
                        }
                    } else {
                        if (selectedOption === index) {
                            btnClass += "border-primary bg-primary/10 text-white shadow-lg shadow-primary/20";
                        } else {
                            btnClass += "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500 text-slate-300";
                        }
                    }

                    return (
                        <button 
                            key={index} 
                            onClick={() => !isSubmitted && setSelectedOption(index)}
                            disabled={isSubmitted}
                            className={btnClass}
                        >
                            <span className="flex-1 font-medium">{option}</span>
                            {isSubmitted && index === puzzle.correctAnswerIndex && <CheckCircle size={20} className="text-emerald-500 ml-3" />}
                            {isSubmitted && index === selectedOption && index !== puzzle.correctAnswerIndex && <XCircle size={20} className="text-rose-500 ml-3" />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Explanation / Footer */}
        {isSubmitted && (
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 mb-6 animate-fade-in">
                <h3 className="text-indigo-300 font-bold mb-2 flex items-center">
                    <Lightbulb size={18} className="mr-2" /> Explanation
                </h3>
                <p className="text-slate-300 leading-relaxed">{puzzle.explanation}</p>
            </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md p-4 border-t border-slate-800 flex justify-between items-center z-20">
        {!isSubmitted ? (
             <Button 
             fullWidth 
             onClick={handleSubmit} 
             disabled={selectedOption === null}
           >
             Submit Answer
           </Button>
        ) : (
            <Button 
                fullWidth 
                variant={selectedOption === puzzle.correctAnswerIndex ? 'primary' : 'secondary'}
                onClick={handleNext}
                className="flex items-center space-x-2"
            >
                <span>Continue</span> <ArrowRight size={18} />
            </Button>
        )}
      </div>
    </div>
  );
};