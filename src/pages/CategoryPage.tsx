import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import CommandCard from "../components/CommandCard";
import Editor from "../components/Editor";
import LoadingSpinner from "../components/LoadingSpinner";
import type { CategoryData } from "../data/categories";
import { findCategory, getRelatedCategories } from "../data/categories";

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const foundCategory = categoryId ? findCategory(categoryId) : null;
      if (foundCategory) {
        setCategory(foundCategory);
      } else {
        setError("Category not found");
      }
    } catch (err) {
      setError("Failed to load category");
      console.error("Error loading category:", err);
    } finally {
      // Add a small delay to ensure smooth transitions
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [categoryId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error || "Category Not Found"}</h2>
        <p className="mb-4">Sorry, we couldn't find the category you're looking for.</p>
        <Link to="/" className="text-blue-400 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  // Sample content for the editor based on the category
  const getEditorContent = () => {
    switch (categoryId) {
      case "basic-movement":
        return `# Basic Movement Commands

Use h, j, k, l to move the cursor:
- h: left
- j: down
- k: up
- l: right

This is a practice area. Try moving around!
---------------------------------------------
Line 1: Try moving to this line with j from the top
Line 2: Now try moving right to the end of this line →
Line 3: And then down to this line
Line 4: Practice moving up with k
Line 5: Try combining movements: 2j to move down 2 lines
---------------------------------------------`;

      case "mode-switching":
        return `# Mode Switching

Vim has several modes:
- Normal mode (Esc): for navigation and commands
- Insert mode (i, I, a, A, o, O): for inserting text
- Visual mode (v, V, Ctrl+v): for selecting text
- Command mode (:): for executing commands

Practice switching between modes:
---------------------------------------------
1. Press i to enter Insert mode and type some text
2. Press Esc to return to Normal mode
3. Press v to enter Visual mode and select some text
4. Press Esc to return to Normal mode
---------------------------------------------`;

      default:
        return `# ${category.title}

${category.description}

This category includes the following commands:
${category.commands.map((cmd) => `- ${cmd.key}: ${cmd.description}`).join("\n")}

Select a specific command from the sidebar to start practicing!`;
    }
  };

  return (
    <Transition show={true} appear={true} enter="transition-opacity duration-300" enterFrom="opacity-0" enterTo="opacity-100">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">{category.title}</h1>
          <p className="text-lg text-neutral-300 mb-6">{category.description}</p>

          <div className="mb-8">
            <Editor content={getEditorContent()} height="300px" />
          </div>

          <h2 className="text-xl font-semibold text-blue-300 mb-4">Commands in this Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.commands.map((command) => (
              <CommandCard
                key={command.id}
                id={command.id}
                categoryId={category.id}
                title={command.title}
                keys={command.key}
                description={command.description}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-700">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">Related Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getRelatedCategories(category.id, 3).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="bg-neutral-800 p-3 rounded border border-neutral-700 hover:border-blue-500 transition-colors"
              >
                <h4 className="font-medium text-blue-400">{cat.title}</h4>
                <p className="text-xs text-neutral-400 mt-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default CategoryPage;
