import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { Noun, WordItem } from './word.types';

const STORAGE_KEY = 'learn-verbs:nouns:known';
const LESSON_KEY = 'learn-verbs:nouns:lessons';

@Injectable({ providedIn: 'root' })
export class NounService {
  private http = inject(HttpClient);
  private readonly nouns$ = this.http
    .get<Noun[]>('assets/nouns.json')
    .pipe(shareReplay(1));

  readonly availableLessons = toSignal(
    this.nouns$.pipe(
      map(items => [...new Set(items.map(v => v.lesson))].sort((a, b) => a - b))
    ),
    { initialValue: [] as number[] }
  );

  private readonly knownSet = signal<Set<number>>(this.loadKnown());
  readonly knownIds = computed(() => [...this.knownSet()]);
  readonly knownCount = computed(() => this.knownSet().size);

  private readonly activeLessons = signal<Set<number>>(this.loadLessons());
  readonly lessonIds = computed(() => this.activeLessons());

  getItems(): Observable<WordItem[]> {
    return this.nouns$;
  }

  isKnown(id: number): boolean {
    return this.knownSet().has(id);
  }

  toggleKnown(id: number): void {
    const next = new Set(this.knownSet());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.knownSet.set(next);
    this.persistKnown(next);
  }

  isLessonActive(n: number): boolean {
    return this.activeLessons().has(n);
  }

  toggleLesson(n: number): void {
    const current = this.activeLessons();
    if (current.has(n) && current.size <= 1) return;
    const next = new Set(current);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    this.activeLessons.set(next);
    this.persistLessons(next);
  }

  itemsForLessons(items: WordItem[]): WordItem[] {
    const lessons = this.activeLessons();
    return items.filter(v => lessons.has(v.lesson));
  }

  activeOnly(items: WordItem[]): WordItem[] {
    const known = this.knownSet();
    return items.filter(v => !known.has(v.id));
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  restoreState(known: number[], lessons: number[]): void {
    const knownSet = new Set(known);
    this.knownSet.set(knownSet);
    this.persistKnown(knownSet);
    const lessonSet = new Set(lessons.length ? lessons : [1]);
    this.activeLessons.set(lessonSet);
    this.persistLessons(lessonSet);
  }

  private loadKnown(): Set<number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  private persistKnown(set: Set<number>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch { /* ignore */ }
  }

  private loadLessons(): Set<number> {
    try {
      const raw = localStorage.getItem(LESSON_KEY);
      if (!raw) return new Set([1]);
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) && parsed.length ? parsed : [1]);
    } catch {
      return new Set([1]);
    }
  }

  private persistLessons(set: Set<number>): void {
    try {
      localStorage.setItem(LESSON_KEY, JSON.stringify([...set]));
    } catch { /* ignore */ }
  }
}
