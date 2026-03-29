import type { Team } from '../types';

interface Props {
  team: Team;
  scores: { name: string; score: number; color: string }[];
  onStart: () => void;
}

export const TurnStartScreen: React.FC<Props> = ({ team, scores, onStart }) => {
  const player = team.players[team.currentPlayerIdx];

  return (
    <div className="screen turn-start">
      <div className="turn-start__content">
        <div
          className="team-badge"
          style={{
            background: team.color + '22',
            borderColor: team.color,
            color: team.color,
          }}
        >
          {team.name}
        </div>

        <div className="turn-start__player">
          <p className="turn-start__label">תורו של</p>
          <h1 className="turn-start__name">{player.name}</h1>
        </div>

        <p className="turn-start__hint">
          תאר את המילה לקבוצה שלך
          <br />
          החלק ימינה = ניחשו&nbsp;&nbsp;|&nbsp;&nbsp;שמאלה = דילוג
        </p>
      </div>

      <div className="scores-preview">
        {scores.map((s, i) => (
          <div key={i} className="scores-preview__row">
            <div className="flex-row gap-8">
              <span
                className="score-dot"
                style={{ background: s.color }}
              />
              <span className="scores-preview__name">{s.name}</span>
            </div>
            <span className="scores-preview__value">{s.score}</span>
          </div>
        ))}
      </div>

      <button className="btn btn--black btn--block btn--lg" onClick={onStart}>
        התחל! ▶
      </button>
    </div>
  );
};
