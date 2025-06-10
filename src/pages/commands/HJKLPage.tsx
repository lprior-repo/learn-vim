import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '../../components/Editor';
import ModeIndicator from '../../components/ModeIndicator';

const INITIAL_CONTENT = `# HJKL Navigation Commands

In Vim, you navigate using h, j, k, l instead of arrow keys:

h - move left
j - move down
k - move up
l - move right

## Basic Exercise

Try to navigate through the maze below using only h, j, k, l keys.
Start at S, navigate to E without touching any # walls.

#################
#S              #
# ############# #
#               #
# # ########### #
# #             #
# ############ ##
#               #
############## E#
#################

## Advanced Exercise

You can also combine these with numbers for faster movement:
- 5j moves down 5 lines
- 10l moves right 10 characters

Try to navigate from the start (S) to the end (E) in each line below 
using a count with the movement keys (e.g., 5j, 10l).

S--------------------E
S-------------------E
S------------------E
S-----------------E
S----------------E
S---------------E
S--------------E
S-------------E
S------------E
S-----------E

Press 'gg' to go to the top of the file if you get lost.
`;

const EXPECTED_STATES = [
  {
    level: 'basic',
    description: 'Navigate through the maze from S to E',
    checkCompletion: (content: string, cursorPosition: any) => {
      // In a real implementation, we would check if the cursor is at the E position
      // This is a simplified version
      return cursorPosition.lineNumber === 8 && cursorPosition.column === 15;
    },
    reward: 'You successfully navigated through the maze using hjkl keys!'
  },
  {
    level: 'advanced',
    description: 'Use count with movement keys (e.g., 5j, 10l)',
    checkCompletion: (content: string, cursorPosition: any) => {
      // In a real implementation, check if the cursor reached multiple E positions
      return cursorPosition.lineNumber >= 23;
    },
    reward: 'Excellent! You mastered using counts with movement keys for efficient navigation!'
  }
];

type ChallengeState = {
  completed: boolean;
  message: string;
};

const HJKLPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<string>('Normal');
  const [content, setContent] = useState<string>(INITIAL_CONTENT);
  const [cursorPosition, setCursorPosition] = useState<any>({ lineNumber: 0, column: 0 });
  const [challenges, setChallenges] = useState<ChallengeState[]>([
    { completed: false, message: '' },
    { completed: false, message: '' }
  ]);
  
  // Handle cursor position changes
  useEffect(() => {
    if (!cursorPosition) return;
    
    // Check for completion of challenges
    const updatedChallenges = [...challenges];
    
    EXPECTED_STATES.forEach((state, index) => {
      if (!updatedChallenges[index].completed && state.checkCompletion(content, cursorPosition)) {
        updatedChallenges[index] = { 
          completed: true, 
          message: state.reward 
        };
      }
    });
    
    setChallenges(updatedChallenges);
  }, [cursorPosition, content]);
  
  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };
  
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };
  
  const handleCommandExecuted = (command: string) => {
    // In a real implementation, we would track commands here
    console.log('Command executed:', command);
  };
  
  const handleCursorPosition = (position: any) => {
    setCursorPosition(position);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-400 mb-2">Basic Movement: HJKL Keys</h1>
      <p className="text-lg text-neutral-300 mb-4">
        Learn to navigate efficiently using h (left), j (down), k (up), and l (right).
      </p>
      
      <div className="mb-4">
        <ModeIndicator mode={currentMode} className="mb-2" />
      </div>
      
      <div className="bg-neutral-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-2">Command Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-neutral-700 p-2 rounded text-center">
            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded font-mono mb-1">h</span>
            <p className="text-sm">Move left</p>
          </div>
          <div className="bg-neutral-700 p-2 rounded text-center">
            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded font-mono mb-1">j</span>
            <p className="text-sm">Move down</p>
          </div>
          <div className="bg-neutral-700 p-2 rounded text-center">
            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded font-mono mb-1">k</span>
            <p className="text-sm">Move up</p>
          </div>
          <div className="bg-neutral-700 p-2 rounded text-center">
            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded font-mono mb-1">l</span>
            <p className="text-sm">Move right</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-3">Practice</h2>
        <p className="text-neutral-300 mb-4">
          Use the editor below to practice HJKL navigation. Complete the challenges to master these commands.
        </p>
        
        <Editor
          content={INITIAL_CONTENT}
          onModeChange={handleModeChange}
          onContentChange={handleContentChange}
          onCommandExecuted={handleCommandExecuted}
          height="400px"
        />
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-blue-300 mb-3">Challenge Progress</h2>
        <div className="space-y-4">
          {EXPECTED_STATES.map((state, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                challenges[index].completed 
                  ? 'bg-green-900/30 border-green-700' 
                  : 'bg-neutral-800 border-neutral-600'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  challenges[index].completed ? 'bg-green-500' : 'bg-neutral-700'
                }`}>
                  {challenges[index].completed && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {state.level === 'basic' ? 'Basic Challenge' : 'Advanced Challenge'}
                  </h3>
                  <p className="text-neutral-300 text-sm">{state.description}</p>
                </div>
              </div>
              
              {challenges[index].completed && (
                <div className="mt-3 text-green-400 pl-9">
                  {challenges[index].message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-neutral-700">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">Tips & Tricks</h3>
        <ul className="list-disc pl-5 space-y-2 text-neutral-300">
          <li>Practice using <strong className="text-white">hjkl</strong> instead of arrow keys to build muscle memory.</li>
          <li>Remember that <strong className="text-white">h</strong> is on the left side of the group, like the direction it moves.</li>
          <li>Use <strong className="text-white">j</strong> to move down because it "drops" below the baseline (like the letter j).</li>
          <li>Combine with numbers: <strong className="text-white">5j</strong> moves down 5 lines, <strong className="text-white">10l</strong> moves right 10 characters.</li>
        </ul>
      </div>
    </div>
  );
};

export default HJKLPage;