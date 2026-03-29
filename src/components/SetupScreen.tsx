import { useRef, useState } from 'react';
import type { Team, Player } from '../types';
import { TEAM_COLORS } from '../data/words';

interface Props {
  onDone: (teams: Team[], turnDuration: number) => void;
}

let _teamId = 3;
let _playerId = 1;

export const SetupScreen: React.FC<Props> = ({ onDone }) => {
  const [teams, setTeams] = useState<Omit<Team, 'score' | 'currentPlayerIdx'>[]>([
    { id: 1, name: 'קבוצה א', color: TEAM_COLORS[0], players: [] },
    { id: 2, name: 'קבוצה ב', color: TEAM_COLORS[1], players: [] },
  ]);
  const [inputs, setInputs] = useState<Record<number, string>>({ 1: '', 2: '' });
  const [duration, setDuration] = useState(60);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const addTeam = () => {
    const id = _teamId++;
    setTeams((t) => [
      ...t,
      {
        id,
        name: `קבוצה ${String.fromCharCode(0x05d0 + t.length)}`,
        color: TEAM_COLORS[t.length % TEAM_COLORS.length],
        players: [],
      },
    ]);
    setInputs((p) => ({ ...p, [id]: '' }));
  };

  const removeTeam = (id: number) => {
    if (teams.length <= 1) return;
    setTeams((t) => t.filter((team) => team.id !== id));
  };

  const updateName = (id: number, name: string) =>
    setTeams((t) => t.map((team) => (team.id === id ? { ...team, name } : team)));

  const addPlayer = (teamId: number) => {
    const name = inputs[teamId]?.trim();
    if (!name) return;
    const player: Player = { id: _playerId++, name, score: 0 };
    setTeams((t) =>
      t.map((team) =>
        team.id === teamId ? { ...team, players: [...team.players, player] } : team,
      ),
    );
    setInputs((p) => ({ ...p, [teamId]: '' }));
    setTimeout(() => inputRefs.current[teamId]?.focus(), 0);
  };

  const removePlayer = (teamId: number, playerId: number) =>
    setTeams((t) =>
      t.map((team) =>
        team.id === teamId
          ? { ...team, players: team.players.filter((p) => p.id !== playerId) }
          : team,
      ),
    );

  const canStart = teams.every((t) => t.players.length >= 2);

  const handleStart = () => {
    if (!canStart) return;
    const fullTeams: Team[] = teams.map((t) => ({
      ...t,
      score: 0,
      currentPlayerIdx: 0,
    }));
    onDone(fullTeams, duration);
  };

  return (
    <div className="screen screen--scroll">
      <h1 className="screen__title">אליאס</h1>
      <p className="screen__sub">הגדרת משחק</p>

      {teams.map((team, idx) => (
        <div key={team.id} className="team-block">
          <div className="team-block__header">
            <span className="team-dot" style={{ background: TEAM_COLORS[idx % TEAM_COLORS.length] }} />
            <input
              className="input team-name-input"
              value={team.name}
              onChange={(e) => updateName(team.id, e.target.value)}
            />
            {teams.length > 1 && (
              <button className="btn btn--icon" onClick={() => removeTeam(team.id)}>
                ✕
              </button>
            )}
          </div>

          <div className="player-tags">
            {team.players.map((p) => (
              <span key={p.id} className="player-tag">
                {p.name}
                <span
                  className="player-tag__remove"
                  onClick={() => removePlayer(team.id, p.id)}
                >
                  ×
                </span>
              </span>
            ))}
          </div>

          <div className="input-row">
            <input
              ref={(el) => { inputRefs.current[team.id] = el; }}
              className="input"
              placeholder="הוסף שחקן..."
              value={inputs[team.id] ?? ''}
              onChange={(e) => setInputs((p) => ({ ...p, [team.id]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer(team.id)}
            />
            <button className="btn btn--sm btn--black" onClick={() => addPlayer(team.id)}>
              +
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn--outline btn--block" onClick={addTeam}>
        + הוסף קבוצה
      </button>

      <div className="divider" />

      <div className="setting-row">
        <span className="setting-label">זמן לכל תור (שניות)</span>
        <div className="stepper">
          <button
            className="btn btn--sm btn--gray"
            onClick={() => setDuration((d) => Math.max(15, d - 15))}
          >
            −
          </button>
          <span className="stepper__value">{duration}</span>
          <button
            className="btn btn--sm btn--gray"
            onClick={() => setDuration((d) => Math.min(180, d + 15))}
          >
            +
          </button>
        </div>
      </div>

      {!canStart && (
        <p className="hint-text">כל קבוצה חייבת לפחות 2 שחקנים</p>
      )}

      <button
        className="btn btn--black btn--block btn--lg"
        onClick={handleStart}
        disabled={!canStart}
        style={{ opacity: canStart ? 1 : 0.4 }}
      >
        המשך לקטגוריות ←
      </button>
    </div>
  );
};
