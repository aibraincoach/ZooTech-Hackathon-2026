import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext';
import ThemeToggle from '../shared/ThemeToggle';
import { questions } from '../../data/questions';
import { prewarmVoiceTts } from '../../utils/voice/web-ai-engine';

const VoiceQuizQuestions = lazy(() => import('./VoiceQuizQuestions'));

const VoiceQuizContainer: React.FC = () => {
  const { quizState, goToNextQuestion, goToPreviousQuestion, goToQuestionIndex, setQuestionAnswers, resetForVoiceIntro } = useQuiz();
  const currentIndex = quizState.currentQuestionIndex;
  const clearTimeoutsRef = useRef<() => void>(() => {});
  const [isPreparingVoice, setIsPreparingVoice] = React.useState(false);

  const [prewarmReady, setPrewarmReady] = React.useState(false);
  const [loadProgress, setLoadProgress] = React.useState<number | null>(null);

  // If we landed here with stale state (e.g. from sessionStorage), show intro and reset so we never render blank.
  useEffect(() => {
    if (currentIndex >= questions.length) {
      resetForVoiceIntro();
    }
  }, [currentIndex, resetForVoiceIntro]);

  // Start loading the voice model as soon as the intro is shown; pass progress so we can show "Loading… 45%".
  useEffect(() => {
    if (currentIndex !== -1 && currentIndex < questions.length) return;
    const p = prewarmVoiceTts({ onProgress: (progress) => setLoadProgress(progress) });
    p.then(() => {
      setPrewarmReady(true);
      setLoadProgress(null);
    }).catch(() => setPrewarmReady(false));
  }, [currentIndex]);

  // Intro screen: no audio models loaded yet, so the page renders immediately. Also show when index is out of range until reset.
  if (currentIndex === -1 || currentIndex >= questions.length) {
    const handleStartVoiceQuiz = async () => {
      setIsPreparingVoice(true);
      try {
        await prewarmVoiceTts();
      } catch (error) {
        console.warn('Kokoro prewarm failed, continuing with runtime fallback:', error);
      } finally {
        setIsPreparingVoice(false);
        goToNextQuestion();
      }
    };

    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">Varkly — Voice quiz</span>
            <ThemeToggle />
          </div>
        </nav>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Voice quiz</h1>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Answer in your own words
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
            We&apos;ll ask each question out loud. Reply with your natural answer; we&apos;ll match it to the VARK options.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-lg">
            {prewarmReady
              ? 'Voice model ready. Click below to start—first question will play quickly.'
              : loadProgress != null
                ? `Loading voice model… ${Math.round(loadProgress)}%`
                : 'Voice model is loading in the background (first time can take a minute). Click when ready—or wait until it says ready.'}
          </p>
          <motion.button
            type="button"
            onClick={handleStartVoiceQuiz}
            className="btn-primary px-8 py-3 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPreparingVoice}
          >
            {isPreparingVoice ? 'Loading voice model…' : prewarmReady ? 'Start voice quiz' : 'Start voice quiz (model loading…)'}
          </motion.button>
        </main>
      </div>
    );
  }

  // Questions: nav in this chunk so it's not cached with the lazy child; pass ref so child can clear timeouts on nav.
  const currentQuestion = currentIndex >= 0 && currentIndex < questions.length ? questions[currentIndex] : null;
  const handleSkipFromNav = () => {
    if (!currentQuestion) return;
    setQuestionAnswers(currentQuestion.id, []);
    goToNextQuestion();
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b-2 border-violet-400 dark:border-violet-500 bg-violet-100 dark:bg-violet-900/80 shadow-lg"
        aria-label="Quiz navigation"
      >
        <div className="max-w-5xl mx-auto px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-sm font-bold text-violet-900 dark:text-violet-100">Varkly Voice</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { clearTimeoutsRef.current(); goToPreviousQuestion(); }}
                disabled={currentIndex <= 0}
                className="px-2 py-1.5 rounded text-sm font-medium bg-white dark:bg-gray-800 border-2 border-violet-400 text-violet-800 dark:text-violet-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-200 dark:hover:bg-violet-800"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => { clearTimeoutsRef.current(); handleSkipFromNav(); }}
                disabled={currentIndex >= questions.length - 1}
                className="px-2 py-1.5 rounded text-sm font-medium bg-white dark:bg-gray-800 border-2 border-violet-400 text-violet-800 dark:text-violet-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-200 dark:hover:bg-violet-800"
              >
                Next →
              </button>
            </div>
            <span className="text-xs text-violet-700 dark:text-violet-300 font-bold">Jump:</span>
            <div className="flex items-center gap-0.5 flex-wrap">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { clearTimeoutsRef.current(); goToQuestionIndex(i); }}
                  className={`min-w-[26px] h-6 rounded text-xs font-medium ${
                    i === currentIndex
                      ? 'bg-violet-600 text-white ring-2 ring-white'
                      : 'bg-white dark:bg-gray-800 border border-violet-300 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800'
                  }`}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
            <p className="text-lg">Loading audio models…</p>
            <p className="text-sm">First time may take a minute to download.</p>
          </div>
        }
      >
        <VoiceQuizQuestions registerClearTimeouts={(fn) => { clearTimeoutsRef.current = fn ?? (() => {}); }} />
      </Suspense>
    </>
  );
};

export default VoiceQuizContainer;
