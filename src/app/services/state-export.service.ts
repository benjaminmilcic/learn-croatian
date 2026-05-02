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
    const text = await file.text();
    const data: AppState = JSON.parse(text);

    if (data?.version !== 1) throw new Error('Ungültiges Dateiformat');

    this.verbService.restoreState(
      Array.isArray(data.verbs?.known) ? data.verbs.known : [],
      Array.isArray(data.verbs?.lessons) ? data.verbs.lessons : [1],
    );
    this.adjectiveService.restoreState(
      Array.isArray(data.adjectives?.known) ? data.adjectives.known : [],
      Array.isArray(data.adjectives?.lessons) ? data.adjectives.lessons : [1],
    );
    this.nounService.restoreState(
      Array.isArray(data.nouns?.known) ? data.nouns.known : [],
      Array.isArray(data.nouns?.lessons) ? data.nouns.lessons : [1],
    );

    const validCategories: Category[] = ['verbs', 'adjectives', 'nouns'];
    if (validCategories.includes(data.category)) {
      this.categoryService.setCategory(data.category);
    }
  }
}
