import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

import type { Screen, Team, TurnResult, WordItem } from './types';
import { WORD_CATEGORIES } from './data/words';
import { buildWordPool } from './utils/helpers';
import { playBuzzer, playTick, wakeAudio } from './utils/audio';

import { SetupScreen } from './components/SetupScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { TurnStartScreen } from './components/TurnStartScreen';
import { PlayingScreen } from './components/PlayingScreen';
import { TurnEndScreen } from './components/TurnEndScreen';
import { ScoreboardScreen } from './components/ScoreboardScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>(Object.keys(WORD_CATEGORIES));
  const [turnDuration, setTurnDuration] = useState(60);
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);

  const [wordPool, setWordPool] = useState<WordItem[]>([]);
  const [wordIdx, setWordIdx] = useState(0);

  const [turnResults, setTurnResults] = useState<TurnResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  // Refs to avoid stale closures in interval / setTimeout callbacks
  const wordPoolRef = useRef<WordItem[]>([]);
  const wordIdxRef = useRef(0);
  const selectedCatsRef = useRef<string[]>([]);
  const isActiveRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnDurationRef = useRef(turnDuration);

  // Keep refs in sync each render
  wordPoolRef.current = wordPool;
  wordIdxRef.current = wordIdx;
  selectedCatsRef.current = selectedCats;
  turnDurationRef.current = turnDuration;

  // ── Setup ─────────────────────────────────────────────────────────────────
  const handleSetupDone = (newTeams: Team[], duration: number) => {
    setTeams(newTeams);
    setTurnDuration(duration);
    setCurrentTeamIdx(0);
    setScreen('categories');
  };

  // ── Categories ────────────────────────────────────────────────────────────
  const handleCategoriesStart = () => {
    const pool = buildWordPool(selectedCats);
    setWordPool(pool);
    setWordIdx(0);
    setScreen('turnStart');
  };

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  // ── Turn start ────────────────────────────────────────────────────────────
  const startTurn = () => {
    setTurnResults([]);
    setTimeLeft(turnDurationRef.current);
    isActiveRef.current = true;
    setScreen('playing');

    let t = turnDurationRef.current;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t > 0 && t <= 10) playTick(t <= 3);
      if (t <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        isActiveRef.current = false;
        playBuzzer();
        setScreen('turnEnd');
      }
    }, 1000);
  };

  // ── Word advance ──────────────────────────────────────────────────────────
  const advanceWord = () => {
    const next = wordIdxRef.current + 1;
    if (next >= wordPoolRef.current.length) {
      const newPool = buildWordPool(selectedCatsRef.current);
      wordPoolRef.current = newPool;
      wordIdxRef.current = 0;
      setWordPool(newPool);
      setWordIdx(0);
    } else {
      wordIdxRef.current = next;
      setWordIdx(next);
    }
  };

  const handleGuess = useCallback(() => {
    if (!isActiveRef.current) return;
    const word = wordPoolRef.current[wordIdxRef.current]?.word ?? '';
    setTurnResults((prev) => [...prev, { word, guessed: true }]);
    advanceWord();
  }, []); // stable — uses refs

  const handleSkip = useCallback(() => {
    if (!isActiveRef.current) return;
    const word = wordPoolRef.current[wordIdxRef.current]?.word ?? '';
    setTurnResults((prev) => [...prev, { word, guessed: false }]);
    advanceWord();
  }, []);

  // ── Score accounting ──────────────────────────────────────────────────────
  const applyScores = (results: TurnResult[], teamIdx: number) => {
    const points = results.filter((r) => r.guessed).length;
    setTeams((prev) =>
      prev.map((team, idx) => {
        if (idx !== teamIdx) return team;
        const pi = team.currentPlayerIdx;
        return {
          ...team,
          score: team.score + points,
          players: team.players.map((p, pIdx) =>
            pIdx === pi ? { ...p, score: p.score + points } : p,
          ),
          currentPlayerIdx: (pi + 1) % team.players.length,
        };
      }),
    );
  };

  const handleNextTurn = () => {
    applyScores(turnResults, currentTeamIdx);
    setCurrentTeamIdx((prev) => (prev + 1) % teams.length);
    setScreen('turnStart');
  };

  const handleEndGame = () => {
    applyScores(turnResults, currentTeamIdx);
    setScreen('scoreboard');
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const currentTeam = teams[currentTeamIdx];
  const currentWord = wordPool[wordIdx]?.word ?? '...';
  const scoresSummary = teams.map((t) => ({ name: t.name, score: t.score, color: t.color }));

  return (
    <div className="app" onPointerDown={wakeAudio}>
      {screen === 'setup' && <SetupScreen onDone={handleSetupDone} />}

      {screen === 'categories' && (
        <CategoryScreen selected={selectedCats} onToggle={toggleCat} onStart={handleCategoriesStart} />
      )}

      {screen === 'turnStart' && currentTeam && (
        <TurnStartScreen team={currentTeam} scores={scoresSummary} onStart={startTurn} />
      )}

      {screen === 'playing' && currentTeam && (
        <PlayingScreen
          word={currentWord}
          timeLeft={timeLeft}
          maxTime={turnDuration}
          guessCount={turnResults.filter((r) => r.guessed).length}
          skipCount={turnResults.filter((r) => !r.guessed).length}
          teamColor={currentTeam.color}
          teamName={currentTeam.name}
          playerName={currentTeam.players[currentTeam.currentPlayerIdx]?.name ?? ''}
          onGuess={handleGuess}
          onSkip={handleSkip}
        />
      )}

      {screen === 'turnEnd' && currentTeam && (
        <TurnEndScreen
          teamName={currentTeam.name}
          playerName={currentTeam.players[currentTeam.currentPlayerIdx]?.name ?? ''}
          results={turnResults}
          onNext={handleNextTurn}
          onEnd={handleEndGame}
        />
      )}

      {screen === 'scoreboard' && (
        <ScoreboardScreen teams={teams} onPlayAgain={() => setScreen('setup')} />
      )}
    </div>
  );
}

export default App;
