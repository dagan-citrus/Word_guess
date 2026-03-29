import { WORD_CATEGORIES } from '../data/words';

interface Props {
  selected: string[];
  onToggle: (cat: string) => void;
  onStart: () => void;
}

export const CategoryScreen: React.FC<Props> = ({ selected, onToggle, onStart }) => {
  return (
    <div className="screen screen--scroll">
      <h2 className="screen__title">קטגוריות</h2>
      <p className="screen__sub">בחר את הקטגוריות למשחק</p>

      <div className="category-list">
        {Object.entries(WORD_CATEGORIES).map(([cat, words]) => (
          <div key={cat} className="toggle-row" onClick={() => onToggle(cat)}>
            <div>
              <div className="toggle-row__name">{cat}</div>
              <div className="toggle-row__count">{words.length} מילים</div>
            </div>
            <div className={`toggle ${selected.includes(cat) ? 'toggle--on' : ''}`} />
          </div>
        ))}
      </div>

      <div className="screen__footer">
        {selected.length === 0 && (
          <p className="hint-text hint-text--error">יש לבחור לפחות קטגוריה אחת</p>
        )}
        <button
          className="btn btn--black btn--block btn--lg"
          onClick={onStart}
          disabled={selected.length === 0}
          style={{ opacity: selected.length > 0 ? 1 : 0.4 }}
        >
          התחל משחק!
        </button>
      </div>
    </div>
  );
};
