import { Component, inject, signal, computed } from '@angular/core';
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
  closeCircle,
  refresh,
  trophy,
  sparkles,
} from 'ionicons/icons';
import { Verb, VerbService } from '../../services/verb.service';

interface Question {
  verb: Verb;
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
export class QuizPage {
  private verbService = inject(VerbService);

  private allVerbs: Verb[] = [];
  active = signal<Verb[]>([]);
  questions = signal<Question[]>([]);
  index = signal(0);
  score = signal(0);
  selected = signal<string | null>(null);
  finished = signal(false);
  quizStarted = signal(false);

  readonly COUNT_OPTIONS = [5, 10, 20, 0]; // 0 = Alle
  questionCount = signal(10);

  current = computed(() => this.questions()[this.index()]);
  progress = computed(() => {
    const total = this.questions().length;
    return total ? (this.index() + 1) / total : 0;
  });

  readonly MIN_VERBS = 4;

  constructor() {
    addIcons({ checkmarkCircle, closeCircle, refresh, trophy, sparkles });
    this.verbService.getVerbs().subscribe((v) => {
      this.allVerbs = v;
      this.active.set(this.verbService.activeOnly(this.verbService.verbsForLessons(v)));
    });
  }

  ionViewWillEnter() {
    if (this.allVerbs.length) {
      this.active.set(
        this.verbService.activeOnly(this.verbService.verbsForLessons(this.allVerbs)),
      );
    }
  }

  countLabel(n: number): string {
    return n === 0 ? 'Alle' : `${n}`;
  }

  beginQuiz() {
    const active = this.active();
    this.finished.set(false);
    this.selected.set(null);
    this.index.set(0);
    this.score.set(0);

    const n = this.questionCount();
    const total = n === 0 ? active.length : Math.min(n, active.length);
    const picked = this.verbService.shuffle(active).slice(0, total);

    const qs: Question[] = picked.map((verb) => {
      const distractors = this.verbService
        .shuffle(active.filter((x) => x.id !== verb.id))
        .slice(0, 3)
        .map((x) => x.de);
      const options = this.verbService.shuffle([verb.de, ...distractors]);
      return { verb, options, answer: verb.de };
    });
    this.questions.set(qs);
    this.quizStarted.set(true);
  }

  resetToSetup() {
    this.quizStarted.set(false);
    this.finished.set(false);
  }

  choose(option: string) {
    if (this.selected() !== null) return;
    this.selected.set(option);
    if (option === this.current().answer) {
      this.score.update((s) => s + 1);
    }
  }

  nextQuestion() {
    if (this.index() >= this.questions().length - 1) {
      this.finished.set(true);
      return;
    }
    this.index.update((i) => i + 1);
    this.selected.set(null);
  }

  optionClass(option: string): string {
    const sel = this.selected();
    const base =
      'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10';
    if (sel === null) return `${base} hover:bg-black/10 dark:hover:bg-white/10`;
    const isAnswer = option === this.current().answer;
    const isPicked = option === sel;
    if (isAnswer)
      return 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-200';
    if (isPicked)
      return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-200';
    return `${base} opacity-60`;
  }
}
