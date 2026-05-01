export type Category = 'verbs' | 'adjectives' | 'nouns';

export interface WordItem {
  id: number;
  lesson: number;
  de: string;
  hr: string;
  example: string;
  exampleDe: string;
}

export interface Adjective extends WordItem {
  feminine: string;
  neuter: string;
}

export interface Noun extends WordItem {
  gender: 'm' | 'f' | 'n';
  plural: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  verbs: 'Verben',
  adjectives: 'Adjektive',
  nouns: 'Substantive',
};

export const CATEGORY_LIST_TITLES: Record<Category, string> = {
  verbs: 'Alle Verben',
  adjectives: 'Alle Adjektive',
  nouns: 'Alle Substantive',
};
