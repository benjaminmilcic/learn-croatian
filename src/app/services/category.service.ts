import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { shareReplay, switchMap } from 'rxjs';
import { Category, CATEGORY_LABELS, CATEGORY_LIST_TITLES, WordItem } from './word.types';
import { VerbService } from './verb.service';
import { AdjectiveService } from './adjective.service';
import { NounService } from './noun.service';

const STORAGE_KEY = 'learn-verbs:category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private verbService = inject(VerbService);
  private adjectiveService = inject(AdjectiveService);
  private nounService = inject(NounService);

  readonly selectedCategory = signal<Category>(this.loadCategory());

  private readonly services = {
    verbs: this.verbService,
    adjectives: this.adjectiveService,
    nouns: this.nounService,
  } as const;

  private readonly items$ = toObservable(this.selectedCategory).pipe(
    switchMap(cat => this.services[cat].getItems()),
    shareReplay(1)
  );

  readonly items = toSignal(this.items$, { initialValue: [] as WordItem[] });

  readonly availableLessons = computed(() =>
    this.services[this.selectedCategory()].availableLessons()
  );

  readonly lessonIds = computed(() =>
    this.services[this.selectedCategory()].lessonIds()
  );

  readonly knownCount = computed(() =>
    this.services[this.selectedCategory()].knownCount()
  );

  readonly listTitle = computed(() =>
    CATEGORY_LIST_TITLES[this.selectedCategory()]
  );

  readonly categories: Category[] = ['verbs', 'adjectives', 'nouns'];

  categoryLabel(cat: Category): string {
    return CATEGORY_LABELS[cat];
  }

  setCategory(cat: Category): void {
    this.selectedCategory.set(cat);
    this.persistCategory(cat);
  }

  isLessonActive(n: number): boolean {
    return this.services[this.selectedCategory()].isLessonActive(n);
  }

  toggleLesson(n: number): void {
    this.services[this.selectedCategory()].toggleLesson(n);
  }

  isKnown(id: number): boolean {
    return this.services[this.selectedCategory()].isKnown(id);
  }

  toggleKnown(id: number): void {
    this.services[this.selectedCategory()].toggleKnown(id);
  }

  itemsForLessons(items: WordItem[]): WordItem[] {
    return this.services[this.selectedCategory()].itemsForLessons(items);
  }

  activeOnly(items: WordItem[]): WordItem[] {
    return this.services[this.selectedCategory()].activeOnly(items);
  }

  shuffle<T>(arr: T[]): T[] {
    return this.services[this.selectedCategory()].shuffle(arr);
  }

  private loadCategory(): Category {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as Category | null;
      if (raw === 'adjectives' || raw === 'nouns' || raw === 'verbs') return raw;
      return 'verbs';
    } catch {
      return 'verbs';
    }
  }

  private persistCategory(cat: Category): void {
    try {
      localStorage.setItem(STORAGE_KEY, cat);
    } catch { /* ignore */ }
  }
}
