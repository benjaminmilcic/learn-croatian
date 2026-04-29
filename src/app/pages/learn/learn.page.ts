import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  arrowForward,
  refresh,
  swapHorizontal,
  checkmarkCircle,
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { Verb, VerbService } from '../../services/verb.service';

type Direction = 'de-hr' | 'hr-de';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonProgressBar,
  ],
})
export class LearnPage {
  private verbService = inject(VerbService);

  private allVerbs = signal<Verb[]>([]);
  pool = signal<Verb[]>([]);
  index = signal(0);
  flipped = signal(false);
  direction = signal<Direction>('hr-de');

  current = computed(() => this.pool()[this.index()]);
  progress = computed(() => {
    const total = this.pool().length;
    return total ? (this.index() + 1) / total : 0;
  });

  constructor() {
    addIcons({
      arrowBack,
      arrowForward,
      refresh,
      swapHorizontal,
      checkmarkCircle,
    });
    this.verbService.getVerbs().subscribe((v) => {
      this.allVerbs.set(v);
      this.rebuildPool();
    });
  }

  ionViewWillEnter() {
    if (this.allVerbs().length) this.rebuildPool();
  }

  private rebuildPool() {
    const forLesson = this.verbService.verbsForLessons(this.allVerbs());
    const active = this.verbService.activeOnly(forLesson);
    this.pool.set(this.verbService.shuffle(active));
    this.index.set(0);
    this.flipped.set(false);
  }

  private readonly FLIP_MS = 600;

  flip() {
    this.flipped.update((f) => !f);
  }

  next() {
    this.advance(() =>
      this.index.update((i) => Math.min(i + 1, this.pool().length - 1)),
    );
  }

  prev() {
    this.advance(() => this.index.update((i) => Math.max(i - 1, 0)));
  }

  private advance(move: () => void) {
    if (this.flipped()) {
      this.flipped.set(false);
      setTimeout(move, this.FLIP_MS);
    } else {
      move();
    }
  }

  reshuffle() {
    this.rebuildPool();
  }

  swapDirection(value: Direction) {
    this.direction.set(value);
    this.flipped.set(false);
  }

  frontText(v: Verb): string {
    return this.direction() === 'hr-de' ? v.hr : v.de;
  }

  backText(v: Verb): string {
    return this.direction() === 'hr-de' ? v.de : v.hr;
  }
}
