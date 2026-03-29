import { type CSSProperties, useEffect, useRef, useState } from 'react';

interface Props {
  word: string;
  timeLeft: number;
  maxTime: number;
  guessCount: number;
  skipCount: number;
  teamColor: string;
  teamName: string;
  playerName: string;
  onGuess: () => void;
  onSkip: () => void;
}

type ExitDir = 'right' | 'left' | null;

export const PlayingScreen: React.FC<Props> = ({
  word,
  timeLeft,
  maxTime,
  guessCount,
  skipCount,
  teamColor,
  teamName,
  playerName,
  onGuess,
  onSkip,
}) => {
  const [dragX, setDragX] = useState(0);
  const [exitDir, setExitDir] = useState<ExitDir>(null);
  const [entering, setEntering] = useState(false);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const busy = useRef(false);
  const prevWord = useRef(word);

  // Keep latest callbacks in refs to avoid stale closures in timeouts
  const onGuessRef = useRef(onGuess);
  const onSkipRef = useRef(onSkip);
  onGuessRef.current = onGuess;
  onSkipRef.current = onSkip;

  // Animate in whenever the word changes
  useEffect(() => {
    if (word !== prevWord.current) {
      prevWord.current = word;
      setEntering(true);
      const t = setTimeout(() => setEntering(false), 220);
      return () => clearTimeout(t);
    }
  }, [word]);

  const triggerAction = (dir: 'right' | 'left') => {
    if (busy.current) return;
    busy.current = true;
    isDragging.current = false;
    setDragX(0);
    setExitDir(dir);

    setTimeout(() => {
      setExitDir(null);
      if (dir === 'right') onGuessRef.current();
      else onSkipRef.current();
      // Unblock after a short delay to allow the entering animation to start
      setTimeout(() => {
        busy.current = false;
      }, 80);
    }, 220);
  };

  // ── Drag / swipe ──────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setDragX(e.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = dragX;
    setDragX(0);
    if (Math.abs(dx) > 80) {
      triggerAction(dx > 0 ? 'right' : 'left');
    }
  };

  // ── Card visual ───────────────────────────────────────────────────────────
  const getCardStyle = (): CSSProperties => {
    if (exitDir === 'right') {
      return {
        transform: 'translateX(130vw) rotate(22deg)',
        opacity: 0,
        transition: 'transform 0.22s ease-in, opacity 0.22s ease-in',
      };
    }
    if (exitDir === 'left') {
      return {
        transform: 'translateX(-130vw) rotate(-22deg)',
        opacity: 0,
        transition: 'transform 0.22s ease-in, opacity 0.22s ease-in',
      };
    }
    if (entering) {
      return { animation: 'cardEnter 0.22s ease-out' };
    }
    if (isDragging.current && dragX !== 0) {
      return {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
        transition: 'none',
      };
    }
    return {
      transform: 'translateX(0) rotate(0)',
      transition: 'transform 0.15s ease-out',
    };
  };

  const dragTint =
    dragX > 60 ? '#dcfce7' : dragX < -60 ? '#fee2e2' : '#ffffff';
  const rightOpacity = Math.min(1, Math.max(0, dragX) / 70);
  const leftOpacity = Math.min(1, Math.max(0, -dragX) / 70);

  // ── Timer colours ─────────────────────────────────────────────────────────
  const timerClass =
    timeLeft <= 5
      ? 'timer--danger'
      : timeLeft <= 15
      ? 'timer--warning'
      : '';

  const progressPct = (timeLeft / maxTime) * 100;
  const progressColor =
    timeLeft <= 5
      ? '#dc2626'
      : timeLeft <= 15
      ? '#d97706'
      : '#000000';

  return (
    <div className="screen playing-screen">
      {/* ── Header ── */}
      <div className="playing-header">
        <div>
          <div
            className="team-badge"
            style={{
              background: teamColor + '22',
              borderColor: teamColor,
              color: teamColor,
            }}
          >
            {teamName}
          </div>
          <div className="playing-player">{playerName}</div>
        </div>
        <div className={`timer ${timerClass}`}>{timeLeft}</div>
      </div>

      {/* ── Progress bar ── */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${progressPct}%`,
            background: progressColor,
            transition: 'width 0.95s linear, background 0.4s',
          }}
        />
      </div>

      {/* ── Word Card ── */}
      <div
        className="card-area"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <div
          className="word-card"
          style={{ ...getCardStyle(), background: dragTint }}
        >
          {/* Swipe indicators */}
          <span
            className="swipe-hint swipe-hint--left"
            style={{ opacity: leftOpacity }}
          >
            ✗
          </span>
          <span
            className="swipe-hint swipe-hint--right"
            style={{ opacity: rightOpacity }}
          >
            ✓
          </span>

          <span className="word-text">{word}</span>
        </div>

        {/* Directional nudge labels */}
        <div className="swipe-labels">
          <span style={{ opacity: 0.25 + leftOpacity * 0.75 }}>← דלג</span>
          <span style={{ opacity: 0.25 + rightOpacity * 0.75 }}>ניחשו →</span>
        </div>
      </div>

      {/* ── Action buttons (fallback) ── */}
      <div className="action-row">
        <button
          className="action-btn action-btn--skip"
          onClick={() => triggerAction('left')}
          disabled={busy.current}
        >
          ✗ דילוג
        </button>
        <button
          className="action-btn action-btn--guess"
          onClick={() => triggerAction('right')}
          disabled={busy.current}
        >
          ✓ ניחשו
        </button>
      </div>

      {/* ── Turn score ── */}
      <div className="turn-score-bar">
        <span className="turn-score turn-score--skip">✗ {skipCount}</span>
        <span className="turn-score-label">תוצאת התור</span>
        <span className="turn-score turn-score--guess">{guessCount} ✓</span>
      </div>
    </div>
  );
};
