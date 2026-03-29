import type { TurnResult } from '../types';

interface Props {
  teamName: string;
  playerName: string;
  results: TurnResult[];
  onNext: () => void;
  onEnd: () => void;
}

export const TurnEndScreen: React.FC<Props> = ({
  teamName,
  playerName,
  results,
  onNext,
  onEnd,
}) => {
  const guessed = results.filter((r) => r.guessed).length;
  const skipped = results.filter((r) => !r.guessed).length;

  return (
    <div className="screen screen--scroll">
      <h2 className="screen__title">סוף התור!</h2>
      <p className="screen__sub">
        {teamName} — {playerName}
      </p>

      <div className="stats-row">
        <div className="stat">
          <span className="stat__value stat__value--green">{guessed}</span>
          <span className="stat__label">ניחשו</span>
        </div>
        <div className="stat">
          <span className="stat__value stat__value--red">{skipped}</span>
          <span className="stat__label">דולגו</span>
        </div>
        <div className="stat">
          <span className="stat__value">+{guessed}</span>
          <span className="stat__label">נקודות</span>
        </div>
      </div>

      <div className="results-list">
        {results.map((r, i) => (
          <div key={i} className="result-row">
            <span className="result-row__word">{r.word}</span>
            <span className={`result-row__badge ${r.guessed ? 'badge--green' : 'badge--red'}`}>
              {r.guessed ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn--outline flex-1" onClick={onEnd}>
          סיים משחק
        </button>
        <button className="btn btn--black flex-1" onClick={onNext}>
          תור הבא ←
        </button>
      </div>
    </div>
  );
};
