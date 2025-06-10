import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load components
const Home = React.lazy(() => import("./pages/Home"));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const CommandPage = React.lazy(() => import("./pages/CommandPage"));
const HJKLPage = React.lazy(() => import("./pages/commands/HJKLPage"));
const LearningPathPage = React.lazy(() => import("./pages/LearningPathPage"));
const LearningPathDetailPage = React.lazy(() => import("./pages/LearningPathDetailPage"));

// Loading component
const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
  </div>
);

// Error component
const ErrorPage = () => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold text-red-400">Oops! Something went wrong</h1>
    <p className="mt-4">Please try refreshing the page or navigate back home.</p>
  </div>
);

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary fallback={<ErrorPage />}>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <Home />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: "/category/:categoryId",
    element: (
      <ErrorBoundary fallback={<ErrorPage />}>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <CategoryPage />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: "/category/:categoryId/:commandId",
    element: (
      <ErrorBoundary fallback={<ErrorPage />}>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <CommandPage />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
  },
  // Learning Paths routes
  {
    path: "/learning-paths",
    element: (
      <ErrorBoundary fallback={<ErrorPage />}>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <LearningPathPage />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: "/learning-path/:pathId",
    element: (
      <ErrorBoundary fallback={<ErrorPage />}>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <LearningPathDetailPage />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
  },
  // Special routes for specific command pages with custom implementations
  {
    path: "/category/basic-movement/hjkl",
    element: (
      <ErrorBoundary fallback={<ErrorPage />}>
        <Layout>
          <Suspense fallback={<LoadingPage />}>
            <HJKLPage />
          </Suspense>
        </Layout>
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-red-400">Page Not Found</h1>
          <p className="mt-4">Sorry, the page you're looking for doesn't exist.</p>
        </div>
      </Layout>
    ),
  },
]);

const Routes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
