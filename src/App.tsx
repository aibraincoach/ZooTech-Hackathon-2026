import React, { Component, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { QuizProvider } from './contexts/QuizContext';
import LandingPage from './components/landing/LandingPage';
import QuizContainer from './components/quiz/QuizContainer';
import ResultsPage from './components/results/ResultsPage';

const VoiceQuizContainer = lazy(() => import('./components/quiz/VoiceQuizContainer'));

class VoiceRouteErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Voice quiz error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            The voice quiz failed to load. Check the browser console (F12) for details, or try the text quiz instead.
          </p>
          <a href="/" className="btn-primary px-6 py-3">Back to home</a>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ThemeProvider>
      <QuizProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz/voice" element={
            <VoiceRouteErrorBoundary>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">Loading voice quiz…</div>}>
                <VoiceQuizContainer />
              </Suspense>
            </VoiceRouteErrorBoundary>
          } />
          <Route path="/quiz" element={<QuizContainer />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/r/:hash" element={<ResultsPage />} />
        </Routes>
      </QuizProvider>
    </ThemeProvider>
  );
}

export default App;
