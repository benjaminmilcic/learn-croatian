import { inject, Injectable } from '@angular/core';
import { Category } from './word.types';
import { VerbService } from './verb.service';
import { AdjectiveService } from './adjective.service';
import { NounService } from './noun.service';
import { CategoryService } from './category.service';

interface AppState {
  version: number;
  category: Category;
  verbs: { known: number[]; lessons: number[] };
  adjectives: { known: number[]; lessons: number[] };
  nouns: { known: number[]; lessons: number[] };
}

@Injectable({ providedIn: 'root' })
export class StateExportService {
  private verbService = inject(VerbService);
  private adjectiveService = inject(AdjectiveService);
  private nounService = inject(NounService);
  private categoryService = inject(CategoryService);

  exportState(): void {
    const state: AppState = {
      version: 1,
      category: this.categoryService.selectedCategory(),
      verbs: {
        known: this.verbService.knownIds(),
        lessons: [...this.verbService.lessonIds()],
      },
      adjectives: {
        known: this.adjectiveService.knownIds(),
        lessons: [...this.adjectiveService.lessonIds()],
      },
      nouns: {
        known: this.nounService.knownIds(),
        lessons: [...this.nounService.lessonIds()],
      },
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lernstand-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importState(file: File): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      throw new Error('Ungültiges Dateiformat: kein gültiges JSON');
    }

    if (!isValidAppState(parsed)) throw new Error('Ungültiges Dateiformat');

    this.verbService.restoreState(parsed.verbs.known, parsed.verbs.lessons);
    this.adjectiveService.restoreState(parsed.adjectives.known, parsed.adjectives.lessons);
    this.nounService.restoreState(parsed.nouns.known, parsed.nouns.lessons);
    this.categoryService.setCategory(parsed.category);
  }
}

function isNumberArray(val: unknown): val is number[] {
  return Array.isArray(val) && val.every((x) => typeof x === 'number');
}

function isValidWordState(val: unknown): val is { known: number[]; lessons: number[] } {
  if (typeof val !== 'object' || val === null) return false;
  const v = val as Record<string, unknown>;
  return isNumberArray(v['known']) && isNumberArray(v['lessons']);
}

function isValidAppState(data: unknown): data is AppState {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  const validCategories: Category[] = ['verbs', 'adjectives', 'nouns'];
  return (
    d['version'] === 1 &&
    validCategories.includes(d['category'] as Category) &&
    isValidWordState(d['verbs']) &&
    isValidWordState(d['adjectives']) &&
    isValidWordState(d['nouns'])
  );
}
