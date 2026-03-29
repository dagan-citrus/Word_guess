import { WORD_CATEGORIES } from '../data/words';
import type { WordItem } from '../types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildWordPool(selectedCategories: string[]): WordItem[] {
  const words: WordItem[] = [];
  for (const [cat, catWords] of Object.entries(WORD_CATEGORIES)) {
    if (selectedCategories.includes(cat)) {
      words.push(...catWords.map((w) => ({ word: w, category: cat })));
    }
  }
  return shuffle(words);
}
