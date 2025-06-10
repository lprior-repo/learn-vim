import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import Editor from "../components/Editor";
import ModeIndicator from "../components/ModeIndicator";
import LoadingSpinner from "../components/LoadingSpinner";
import type { CategoryData, CommandData } from "../data/categories";
import { findCategory, findCommand, getRelatedCommands } from "../data/categories";

// Type definitions
type CommandPageParams = {
  categoryId: string;
  commandId: string;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  initialContent: string;
  successCriteria: (content: string, mode: string, commandsUsed: string[]) => boolean;
  hint: string;
  solution: string;
};

type ChallengeState = {
  completed: boolean;
  message: string;
};

const CommandPage: React.FC = () => {
  const { categoryId, commandId } = useParams<CommandPageParams>();

  // State
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [command, setCommand] = useState<CommandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<string>("Normal");
  const [content, setContent] = useState<string>("");
  const [commandsUsed, setCommandsUsed] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<ChallengeState[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Load category and command data with editor initialization
  useEffect(() => {
    let mounted = true;
    const initializePage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!categoryId || !commandId) {
          throw new Error("Invalid category or command");
        }

        // Load data
        const foundCategory = findCategory(categoryId);
        const foundCommand = foundCategory ? findCommand(categoryId, commandId) : null;

        if (!foundCategory || !foundCommand) {
          throw new Error("Command not found");
        }

        if (mounted) {
          setCategory(foundCategory);
          setCommand(foundCommand);

          // Wait for Monaco and Vim to be ready
          await new Promise<void>((resolve) => {
            const checkEditor = () => {
              if ((window as any).monaco && (window as any).MonacoVim) {
                resolve();
              } else {
                setTimeout(checkEditor, 100);
              }
            };
            checkEditor();
          });

          // Initialize editor state
          const initialChallenges = commandChallenges.map(() => ({
            completed: false,
            message: "",
          }));
          setChallenges(initialChallenges);
          setContent(commandChallenges[0]?.initialContent || "");
        }
      } catch (err) {
        console.error("Error initializing page:", err);
        if (mounted) {
          setError(err.message || "Failed to load command");
        }
      } finally {
        // Ensure minimum loading time for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializePage();
    return () => {
      mounted = false;
    };
  }, [categoryId, commandId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !category || !command) {
    return <Navigate to="/" />;
  }

  // This would normally be loaded dynamically based on the command
  const commandChallenges: Challenge[] = [
    {
      id: "1",
      title: "Basic Usage",
      description: `Practice using the ${command.key} command in a simple scenario.`,
      initialContent: `# Practice ${command.title}\n\nThis is a sample practice area.\nTry using the ${command.key} command here.`,
      successCriteria: (content, mode, commandsUsed) => {
        // This would contain custom logic to check if the challenge was completed
        return commandsUsed.includes(command.key.split(" ")[0]);
      },
      hint: `Try pressing ${command.key} in normal mode.`,
      solution: `1. Make sure you're in normal mode (press Esc)\n2. Press ${command.key}\n3. Observe the effect`,
    },
  ];

  // Track command execution with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkCompletion = () => {
      const currentChallenge = commandChallenges[activeChallenge];
      if (currentChallenge && !challenges[activeChallenge]?.completed) {
        if (currentChallenge.successCriteria(content, currentMode, commandsUsed)) {
          const updatedChallenges = [...challenges];
          updatedChallenges[activeChallenge] = {
            completed: true,
            message: "Great job! You've completed this challenge.",
          };
          setChallenges(updatedChallenges);
        }
      }
    };

    if (commandsUsed.length > 0) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkCompletion, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [commandsUsed, content, currentMode, activeChallenge]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Check if the current challenge is completed
    const currentChallenge = commandChallenges[activeChallenge];
    if (currentChallenge && !challenges[activeChallenge].completed) {
      if (currentChallenge.successCriteria(newContent, currentMode, commandsUsed)) {
        const updatedChallenges = [...challenges];
        updatedChallenges[activeChallenge] = {
          completed: true,
          message: "Great job! You've completed this challenge.",
        };
        setChallenges(updatedChallenges);
      }
    }
  };

  // Handle mode changes
  const handleModeChange = (mode: string) => {
    setCurrentMode(mode);
  };

  // Handle command execution
  const handleCommandExecuted = (executedCommand: string) => {
    setCommandsUsed((prev) => [...prev, executedCommand]);
  };

  // Move to the next challenge
  const handleNextChallenge = () => {
    if (activeChallenge < commandChallenges.length - 1) {
      setActiveChallenge(activeChallenge + 1);
      setContent(commandChallenges[activeChallenge + 1].initialContent);
      setCommandsUsed([]);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  // Move to the previous challenge
  const handlePreviousChallenge = () => {
    if (activeChallenge > 0) {
      setActiveChallenge(activeChallenge - 1);
      setContent(commandChallenges[activeChallenge - 1].initialContent);
      setCommandsUsed([]);
      setShowHint(false);
      setShowSolution(false);
    }
  };

  // Reset the current challenge
  const handleResetChallenge = () => {
    setContent(commandChallenges[activeChallenge].initialContent);
    setCommandsUsed([]);

    // Reset the challenge state
    const updatedChallenges = [...challenges];
    updatedChallenges[activeChallenge] = { completed: false, message: "" };
    setChallenges(updatedChallenges);

    setShowHint(false);
    setShowSolution(false);
  };

  return (
    <Transition show={true} appear={true} enter="transition-all duration-300" enterFrom="opacity-0 translate-y-4" enterTo="opacity-100 translate-y-0">
      <div>
        <div className="mb-6">
          <Link to={`/category/${categoryId}`} className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
            ← Back to {category.title}
          </Link>
          <h1 className="text-3xl font-bold text-blue-400 mb-2">{command.title}</h1>
          <p className="text-lg text-neutral-300 mb-4">{command.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <ModeIndicator mode={currentMode} className="mb-2" />
            </div>

            <div className="bg-neutral-800 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-2">Command Reference</h2>
              <div className="flex flex-wrap gap-3">
                {command.key.split(" ").map((key, index) => (
                  <div key={index} className="bg-neutral-700 p-2 rounded text-center">
                    <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded font-mono mb-1">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            <Transition show={true} enter="transition-all duration-300" enterFrom="opacity-0 -translate-y-4" enterTo="opacity-100 translate-y-0">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-blue-300">Challenge: {commandChallenges[activeChallenge]?.title}</h2>
                  <div className="text-sm text-neutral-400">
                    {activeChallenge + 1} of {commandChallenges.length}
                  </div>
                </div>
                <p className="text-neutral-300 mb-4">{commandChallenges[activeChallenge]?.description}</p>

                <Editor
                  content={content}
                  onModeChange={handleModeChange}
                  onContentChange={handleContentChange}
                  onCommandExecuted={handleCommandExecuted}
                  height="400px"
                />

                {challenges[activeChallenge]?.completed && (
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-400">{challenges[activeChallenge].message}</p>
                    {activeChallenge < commandChallenges.length - 1 && (
                      <button onClick={handleNextChallenge} className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded">
                        Next Challenge →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Transition>

            <div className="flex space-x-3">
              <button onClick={handleResetChallenge} className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded">
                Reset Challenge
              </button>
              <button onClick={() => setShowHint(!showHint)} className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded">
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
              <button onClick={() => setShowSolution(!showSolution)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded">
                {showSolution ? "Hide Solution" : "Show Solution"}
              </button>
            </div>

            <Transition
              show={showHint}
              enter="transition-all duration-300"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition-all duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <h3 className="text-lg font-medium text-blue-400 mb-2">Hint</h3>
                <p className="text-neutral-300">{commandChallenges[activeChallenge]?.hint}</p>
              </div>
            </Transition>

            <Transition
              show={showSolution}
              enter="transition-all duration-300"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition-all duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <div className="mt-4 p-4 bg-purple-900/30 border border-purple-700 rounded-lg">
                <h3 className="text-lg font-medium text-purple-400 mb-2">Solution</h3>
                <pre className="text-neutral-300 whitespace-pre-wrap font-mono text-sm">{commandChallenges[activeChallenge]?.solution}</pre>
              </div>
            </Transition>
          </div>

          <div>
            <div className="bg-neutral-800 rounded-lg p-4 sticky top-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Tips & Tricks</h2>
              <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                <li>
                  Press <strong className="text-white">Esc</strong> to ensure you're in normal mode before using this command.
                </li>
                <li>
                  You can combine this command with counts (e.g., <strong className="text-white">5{command.key}</strong>) to repeat it.
                </li>
                <li>This command works in both normal and visual modes.</li>
                <li>Practice regularly to build muscle memory for this command.</li>
              </ul>

              <h3 className="text-lg font-semibold text-blue-300 mt-6 mb-3">Related Commands</h3>
              <ul className="space-y-2">
                {getRelatedCommands(categoryId, command.id, 3).map((cmd) => (
                  <li key={cmd.id}>
                    <Link to={`/category/${categoryId}/${cmd.id}`} className="text-blue-400 hover:text-blue-300">
                      {cmd.title} (<code className="bg-neutral-700 px-1 rounded">{cmd.key}</code>)
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold text-blue-300 mt-6 mb-3">Challenge Navigation</h3>
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousChallenge}
                  disabled={activeChallenge === 0}
                  className={`px-3 py-1 rounded ${
                    activeChallenge === 0 ? "bg-neutral-700 text-neutral-500 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-600 text-white"
                  }`}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextChallenge}
                  disabled={activeChallenge === commandChallenges.length - 1}
                  className={`px-3 py-1 rounded ${
                    activeChallenge === commandChallenges.length - 1
                      ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-600 text-white"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default CommandPage;
