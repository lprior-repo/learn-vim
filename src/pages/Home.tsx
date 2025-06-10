import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import CommandCard from '../components/CommandCard';
import { createVimCommandRepository } from '../data/VimCommandRepository';
import { getCommandsByCategory } from '../domain/VimCommand';

/**
 * Home page component following functional programming principles
 * 
 * Principles applied:
 * - Pure functional components where possible
 * - Memoized computations
 * - Immutable data structures
 * - Separation of data and presentation
 */
const Home: React.FC = () => {
  // Use repository for data access (dependency injection in real app)
  const repository = useMemo(() => createVimCommandRepository(), []);
  
  // Memoized featured commands computation
  const featuredCommands = useMemo(() => {
    const allCommands = repository.getAllCommands();
    const categories = ['navigation', 'editing', 'modes', 'text-objects'] as const;
    
    return categories.map(category => {
      const categoryCommands = getCommandsByCategory(allCommands, category);
      const beginnerCommands = categoryCommands
        .filter(cmd => cmd.difficulty === 'beginner')
        .slice(0, 2);
      
      return {
        categoryId: category,
        categoryTitle: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
        commands: beginnerCommands
      };
    }).filter(featured => featured.commands.length > 0);
  }, [repository]);

  return (
    <div>
      <section className="mb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-4">Welcome to Vim Trainer</h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Master Vim commands through interactive exercises and guided practice.
            Navigate through categories or jump straight to specific commands.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link 
            to="/learning-paths" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 text-center shadow-lg transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">Start Practicing</h2>
            <p>Jump into guided exercises to improve your Vim skills</p>
          </Link>
          
          <Link 
            to="/category/basic-movement" 
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 text-center shadow-lg transition-colors"
          >
            <h2 className="text-2xl font-bold mb-2">Learn Basics</h2>
            <p>Start with fundamental Vim navigation and editing commands</p>
          </Link>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-blue-300 mb-6">Featured Commands</h2>
        
        {featuredCommands.map((featured) => (
          <div key={featured.categoryId} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-neutral-200">{featured.categoryTitle}</h3>
              <Link 
                to={`/category/${featured.categoryId}`}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View all →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured.commands.map((command) => (
                <CommandCard
                  key={command.id}
                  id={command.id}
                  categoryId={featured.categoryId}
                  title={command.description.value}
                  keys={command.keySequence.value}
                  description={command.description.examples?.[0] || command.description.value}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-blue-300 mb-6">Why Learn Vim?</h2>
        
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <div>
                <strong className="text-white">Efficiency:</strong>
                <span className="text-neutral-300"> Edit text at the speed of thought with minimal hand movement.</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <div>
                <strong className="text-white">Ubiquity:</strong>
                <span className="text-neutral-300"> Available on virtually every Unix-based system.</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <div>
                <strong className="text-white">Customizability:</strong>
                <span className="text-neutral-300"> Tailor your editing environment exactly to your preferences.</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <div>
                <strong className="text-white">Modal Editing:</strong>
                <span className="text-neutral-300"> Separate modes for inserting text and manipulating text make complex operations simpler.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;