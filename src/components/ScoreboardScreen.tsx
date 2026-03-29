import type { Team } from '../types';

interface Props {
  teams: Team[];
  onPlayAgain: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export const ScoreboardScreen: React.FC<Props> = ({ teams, onPlayAgain }) => {
  const sorted = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="screen screen--scroll">
      <h1 className="screen__title">סיום המשחק! 🏆</h1>

      {sorted.map((team, idx) => (
        <div key={team.id} className="scoreboard-team">
          <div className="scoreboard-team__header">
            <div className="flex-row gap-8">
              <span className="medal">{MEDALS[idx] ?? '🎖️'}</span>
              <span
                className="scoreboard-team__name"
                style={{ color: team.color }}
              >
                {team.name}
              </span>
            </div>
            <span className="scoreboard-team__total">{team.score}</span>
          </div>

          {team.players.map((p) => (
            <div key={p.id} className="scoreboard-player">
              <span>{p.name}</span>
              <span className="scoreboard-player__score">{p.score}</span>
            </div>
          ))}
        </div>
      ))}

      <button
        className="btn btn--black btn--block btn--lg"
        onClick={onPlayAgain}
        style={{ marginTop: 32 }}
      >
        משחק חדש
      </button>
    </div>
  );
};
