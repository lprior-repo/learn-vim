import React from 'react';
import { Link } from 'react-router-dom';

type CommandCardProps = {
  id: string;
  categoryId: string;
  title: string;
  keys: string;
  description: string;
};

// Pure helper function to extract keys (immutable)
const extractKeys = (keys: string): ReadonlyArray<string> =>
  Object.freeze(
    keys
      .split(' ')
      .map(key => key.trim())
      .filter(key => key.length > 0)
  );

const CommandCard: React.FC<CommandCardProps> = ({ 
  id, 
  categoryId,
  title, 
  keys, 
  description 
}) => {
  // Using our pure extraction function
  const keyArray = extractKeys(keys);
  
  return (
    <Link 
      to={`/category/${categoryId}/${id}`}
      className="block bg-neutral-800 rounded-lg shadow-md border border-neutral-700 hover:border-blue-500 transition-colors p-4 h-full"
      data-testid="command-card"
    >
      <h3 
        className="text-lg font-bold text-blue-400 mb-2"
        data-testid="command-title"
      >
        {title}
      </h3>
      
      <div 
        className="flex flex-wrap gap-2 mb-3"
        data-testid="command-keys"
      >
        {keyArray.map((key, index) => (
          <span 
            key={index}
            className="bg-blue-700 text-white px-2 py-1 rounded font-mono text-sm"
            data-testid="key-badge"
          >
            {key}
          </span>
        ))}
      </div>
      
      <p 
        className="text-neutral-300 text-sm"
        data-testid="command-description"
      >
        {description}
      </p>
    </Link>
  );
};

export default CommandCard;