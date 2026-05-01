import { Component, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
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
  create,
  createOutline,
  createSharp,
  refresh,
  trophy,
  sparkles,
  checkmarkCircle,
  closeCircle,
} from 'ionicons/icons';
import { Verb, VerbService } from '../../services/verb.service';

type Direction = 'hr-to-de' | 'de-to-hr';

@Component({
  selector: 'app-type',
  templateUrl: './type.page.html',
  styleUrls: ['./type.page.scss'],
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
export class TypePage {
  @ViewChild('answerInput') answerInputRef?: ElementRef<HTMLInputElement>;

  private verbService = inject(VerbService);
  private allVerbs: Verb[] = [];

  active = signal<Verb[]>([]);
  direction = signal<Direction>('hr-to-de');
  questionCount = signal(10);
  readonly COUNT_OPTIONS = [5, 10, 20, 0];

  questions = signal<Verb[]>([]);
  index = signal(0);
  score = signal(0);
  inputValue = signal('');
  submitted = signal(false);
  finished = signal(false);
  gameStarted = signal(false);

  current = computed(() => this.questions()[this.index()]);
  progress = computed(() => {
    const total = this.questions().length;
    return total ? (this.index() + 1) / total : 0;
  });

  readonly MIN_VERBS = 2;

  constructor() {
    addIcons({ create, createOutline, createSharp, refresh, trophy, sparkles, checkmarkCircle, closeCircle });
    this.verbService.getVerbs().subscribe((v) => {
      this.allVerbs = v;
      this.active.set(this.verbService.activeOnly(this.verbService.verbsForLessons(v)));
    });
  }

  ionViewWillEnter() {
    if (this.allVerbs.length) {
      this.active.set(this.verbService.activeOnly(this.verbService.verbsForLessons(this.allVerbs)));
    }
  }

  checkAnswer(verb: Verb): boolean {
    const input = this.inputValue().trim().toLowerCase();
    if (!input) return false;
    const correct = this.direction() === 'hr-to-de' ? verb.de : verb.hr;
    return correct.split('/').map((s) => s.trim().toLowerCase()).some((s) => s === input);
  }

  correctAnswer(verb: Verb): string {
    return this.direction() === 'hr-to-de' ? verb.de : verb.hr;
  }

  prompt(verb: Verb): string {
    return this.direction() === 'hr-to-de' ? verb.hr : verb.de;
  }

  example(verb: Verb): string {
    return this.direction() === 'hr-to-de' ? verb.example : verb.exampleDe;
  }

  promptLabel(): string {
    return this.direction() === 'hr-to-de' ? 'Kroatisch' : 'Deutsch';
  }

  answerLabel(): string {
    return this.direction() === 'hr-to-de' ? 'Deutsch' : 'Kroatisch';
  }

  countLabel(n: number): string {
    return n === 0 ? 'Alle' : `${n}`;
  }

  beginGame() {
    const active = this.active();
    this.finished.set(false);
    this.submitted.set(false);
    this.inputValue.set('');
    this.index.set(0);
    this.score.set(0);

    const n = this.questionCount();
    const total = n === 0 ? active.length : Math.min(n, active.length);
    this.questions.set(this.verbService.shuffle(active).slice(0, total));
    this.gameStarted.set(true);

    setTimeout(() => this.answerInputRef?.nativeElement.focus(), 200);
  }

  resetToSetup() {
    this.gameStarted.set(false);
    this.finished.set(false);
  }

  submit() {
    if (this.submitted() || !this.inputValue().trim()) return;
    this.submitted.set(true);
    if (this.checkAnswer(this.current())) {
      this.score.update((s) => s + 1);
    }
  }

  nextQuestion() {
    if (this.index() >= this.questions().length - 1) {
      this.finished.set(true);
      return;
    }
    this.index.update((i) => i + 1);
    this.submitted.set(false);
    this.inputValue.set('');
    setTimeout(() => this.answerInputRef?.nativeElement.focus(), 100);
  }
}
