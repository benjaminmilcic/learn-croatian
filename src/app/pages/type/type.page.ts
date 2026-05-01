import { Component, effect, ElementRef, ViewChild, inject, signal, computed, untracked } from '@angular/core';
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
import { WordItem } from '../../services/word.types';
import { CategoryService } from '../../services/category.service';

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

  readonly categoryService = inject(CategoryService);

  active = signal<WordItem[]>([]);
  direction = signal<Direction>('hr-to-de');
  questionCount = signal(10);
  readonly COUNT_OPTIONS = [5, 10, 20, 0];

  questions = signal<WordItem[]>([]);
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

  readonly MIN_ITEMS = 2;

  constructor() {
    addIcons({ create, createOutline, createSharp, refresh, trophy, sparkles, checkmarkCircle, closeCircle });

    effect(() => {
      const items = this.categoryService.items();
      this.categoryService.lessonIds();
      untracked(() => {
        this.gameStarted.set(false);
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

  checkAnswer(item: WordItem): boolean {
    const input = this.inputValue().trim().toLowerCase();
    if (!input) return false;
    const correct = this.direction() === 'hr-to-de' ? item.de : item.hr;
    return correct.split('/').map(s => s.trim().toLowerCase()).some(s => s === input);
  }

  correctAnswer(item: WordItem): string {
    return this.direction() === 'hr-to-de' ? item.de : item.hr;
  }

  prompt(item: WordItem): string {
    return this.direction() === 'hr-to-de' ? item.hr : item.de;
  }

  example(item: WordItem): string {
    return this.direction() === 'hr-to-de' ? item.example : item.exampleDe;
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
    this.questions.set(this.categoryService.shuffle(active).slice(0, total));
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
      this.score.update(s => s + 1);
    }
  }

  nextQuestion() {
    if (this.index() >= this.questions().length - 1) {
      this.finished.set(true);
      return;
    }
    this.index.update(i => i + 1);
    this.submitted.set(false);
    this.inputValue.set('');
    setTimeout(() => this.answerInputRef?.nativeElement.focus(), 100);
  }
}
