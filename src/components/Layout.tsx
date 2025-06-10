import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { VIM_CATEGORIES } from "../data/categories";
import LoadingSpinner from "./LoadingSpinner";
import ErrorBoundary from "./ErrorBoundary";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Handle route changes and loading states
  useEffect(() => {
    if (location.pathname !== prevPathname) {
      setIsLoading(true);
      setPrevPathname(location.pathname);

      // Simulate loading for smooth transitions
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPathname]);

  // Handle navigation errors
  const handleNavError = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="bg-neutral-800 border-b border-neutral-700 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Vim Trainer
            </Link>
            <nav>
              <ul className="flex space-x-4">
                {[
                  ["Home", "/"],
                  ["About", "/about"],
                  ["Practice", "/practice"],
                ].map(([label, path]) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className={`
                        px-3 py-2 rounded transition-colors
                        ${location.pathname === path ? "bg-blue-800 text-white" : "hover:bg-neutral-700"}
                      `}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 pr-6 mb-6 md:mb-0">
            <nav className="sticky top-24">
              <Transition
                show={!isLoading}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div>
                  <h2 className="text-xl font-bold mb-4 text-blue-300">Command Categories</h2>
                  <ul className="space-y-1">
                    {VIM_CATEGORIES.map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.id}`}
                          className={`
                            block px-3 py-2 rounded-lg transition-colors
                            ${location.pathname.includes(`/category/${category.id}`) ? "bg-blue-800 text-white" : "hover:bg-neutral-800"}
                          `}
                        >
                          {category.title}
                        </Link>

                        {/* Show commands for current category */}
                        <Transition
                          show={location.pathname.includes(`/category/${category.id}`)}
                          enter="transition-all duration-300 ease-out"
                          enterFrom="opacity-0 -translate-y-2"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition-all duration-200 ease-in"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 -translate-y-2"
                        >
                          <ul className="ml-4 mt-1 space-y-1">
                            {category.commands.map((command) => (
                              <li key={command.id}>
                                <Link
                                  to={`/category/${category.id}/${command.id}`}
                                  className={`
                                    block px-3 py-1 text-sm rounded transition-colors
                                    ${
                                      location.pathname.includes(`/category/${category.id}/${command.id}`)
                                        ? "bg-blue-700 text-white"
                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                                    }
                                  `}
                                >
                                  {command.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </Transition>
                      </li>
                    ))}
                  </ul>
                </div>
              </Transition>
            </nav>
          </aside>

          {/* Page content */}
          <main className="flex-1">
            <ErrorBoundary
              fallback={
                <div className="text-center py-12">
                  <h1 className="text-3xl font-bold text-red-400">Something went wrong</h1>
                  <p className="mt-4">Please try refreshing the page or navigate back home.</p>
                </div>
              }
            >
              <Transition
                show={!isLoading}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="bg-neutral-850 rounded-lg border border-neutral-700 p-6">{children}</div>
              </Transition>

              {isLoading && (
                <div className="flex justify-center items-center min-h-[400px]">
                  <LoadingSpinner size="large" />
                </div>
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-800 border-t border-neutral-700 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-neutral-400 text-sm">
          <p>Vim Trainer - Become a Vim expert through interactive exercises</p>
          <p className="mt-1">Practice makes perfect! Keep trying different Vim commands to build muscle memory.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
