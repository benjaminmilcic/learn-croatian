import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface Conjugation {
  ja: string;
  ti: string;
  on: string;
  mi: string;
  vi: string;
  oni: string;
}

export interface Verb {
  id: number;
  lesson: number;
  de: string;
  hr: string;
  example: string;
  exampleDe: string;
  conjugation: Conjugation;
  pastConjugation: Conjugation;
  futureConjugation: Conjugation;
}

const STORAGE_KEY = 'learn-verbs:known';
const LESSON_KEY = 'learn-verbs:lessons';

@Injectable({ providedIn: 'root' })
export class VerbService {
  private http = inject(HttpClient);
  private verbs$?: Observable<Verb[]>;

  private readonly knownSet = signal<Set<number>>(this.loadKnown());
  readonly knownIds = computed(() => this.knownSet());
  readonly knownCount = computed(() => this.knownSet().size);

  private readonly activeLessons = signal<Set<number>>(this.loadLessons());
  readonly lessonIds = computed(() => this.activeLessons());

  getVerbs(): Observable<Verb[]> {
    if (!this.verbs$) {
      this.verbs$ = this.http
        .get<Verb[]>('assets/verbs.json')
        .pipe(shareReplay(1));
    }
    return this.verbs$;
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

  verbsForLessons(verbs: Verb[]): Verb[] {
    const lessons = this.activeLessons();
    return verbs.filter((v) => lessons.has(v.lesson));
  }

  activeOnly(verbs: Verb[]): Verb[] {
    const known = this.knownSet();
    return verbs.filter((v) => !known.has(v.id));
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
    } catch {
      // ignore
    }
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
    } catch {
      // ignore
    }
  }
}
