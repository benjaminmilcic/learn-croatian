import { Component, effect, inject, signal, computed, untracked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  checkmarkCircleOutline,
  closeCircle,
  refresh,
  trophy,
  sparkles,
} from 'ionicons/icons';
import { WordItem } from '../../services/word.types';
import { CategoryService } from '../../services/category.service';

interface Question {
  item: WordItem;
  options: string[];
  answer: string;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonProgressBar,
  ],
})
export class QuizPage implements OnDestroy {
  readonly categoryService = inject(CategoryService);

  active = signal<WordItem[]>([]);
  questions = signal<Question[]>([]);
  index = signal(0);
  score = signal(0);
  selected = signal<string | null>(null);
  finished = signal(false);
  quizStarted = signal(false);
  autoAdvancing = signal(false);
  timerProgress = signal(0);

  private timerRef?: ReturnType<typeof setInterval>;
  private readonly TIMER_MS = 3000;
  private readonly TIMER_STEP_MS = 50;

  readonly COUNT_OPTIONS = [5, 10, 20, 0];
  questionCount = signal(10);

  current = computed(() => this.questions()[this.index()]);
  progress = computed(() => {
    const total = this.questions().length;
    return total ? (this.index() + 1) / total : 0;
  });

  readonly MIN_ITEMS = 4;

  constructor() {
    addIcons({ checkmarkCircle, checkmarkCircleOutline, closeCircle, refresh, trophy, sparkles });

    effect(() => {
      const items = this.categoryService.items();
      this.categoryService.lessonIds();
      untracked(() => {
        this.quizStarted.set(false);
        this.finished.set(false);
        const forLesson = this.categoryService.itemsForLessons(items);
        this.active.set(this.categoryService.activeOnly(forLesson));
      });
    });
  }

  ionViewWillEnter() {
    const items = this.categoryService.items();
    const forLesson = this.categoryService.itemsForLessons(items);
    this.active.set(this.categoryService.activeOnly(forLesson));
  }

  countLabel(n: number): string {
    return n === 0 ? 'Alle' : `${n}`;
  }

  beginQuiz() {
    this.stopTimer();
    const active = this.active();
    this.finished.set(false);
    this.selected.set(null);
    this.index.set(0);
    this.score.set(0);

    const n = this.questionCount();
    const total = n === 0 ? active.length : Math.min(n, active.length);
    const picked = this.categoryService.shuffle(active).slice(0, total);

    const qs: Question[] = picked.map(item => {
      const distractors = this.categoryService
        .shuffle(active.filter(x => x.id !== item.id))
        .slice(0, 3)
        .map(x => x.de);
      const options = this.categoryService.shuffle([item.de, ...distractors]);
      return { item, options, answer: item.de };
    });
    this.questions.set(qs);
    this.quizStarted.set(true);
  }

  resetToSetup() {
    this.stopTimer();
    this.quizStarted.set(false);
    this.finished.set(false);
  }

  choose(option: string) {
    if (this.selected() !== null) return;
    this.selected.set(option);
    if (option === this.current().answer) {
      this.score.update(s => s + 1);
      this.startAutoAdvance();
    }
  }

  private startAutoAdvance() {
    this.timerProgress.set(0);
    this.autoAdvancing.set(true);
    let elapsed = 0;
    this.timerRef = setInterval(() => {
      elapsed += this.TIMER_STEP_MS;
      this.timerProgress.set(elapsed / this.TIMER_MS);
      if (elapsed >= this.TIMER_MS) {
        this.stopTimer();
        this.nextQuestion();
      }
    }, this.TIMER_STEP_MS);
  }

  cancelAutoAdvance() {
    this.stopTimer();
    this.autoAdvancing.set(false);
  }

  private stopTimer() {
    if (this.timerRef !== undefined) {
      clearInterval(this.timerRef);
      this.timerRef = undefined;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  nextQuestion() {
    this.stopTimer();
    this.autoAdvancing.set(false);
    if (this.index() >= this.questions().length - 1) {
      this.finished.set(true);
      return;
    }
    this.index.update(i => i + 1);
    this.selected.set(null);
  }

  markKnown() {
    const q = this.current();
    if (!q) return;
    this.categoryService.toggleKnown(q.item.id);
    this.nextQuestion();
  }

  optionClass(option: string): string {
    const sel = this.selected();
    const base = 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10';
    if (sel === null) return `${base} hover:bg-black/10 dark:hover:bg-white/10`;
    const isAnswer = option === this.current().answer;
    const isPicked = option === sel;
    if (isAnswer) return 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-200';
    if (isPicked) return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-200';
    return `${base} opacity-60`;
  }
}
