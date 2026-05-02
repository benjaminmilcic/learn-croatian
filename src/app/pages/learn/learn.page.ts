import { Component, effect, inject, signal, computed, untracked } from '@angular/core';
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
  checkmarkCircleOutline,
  informationCircleOutline,
  informationCircleSharp,
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { WordItem } from '../../services/word.types';
import { CategoryService } from '../../services/category.service';
import { WordDetailsComponent } from '../../components/word-details/word-details.component';

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
    WordDetailsComponent,
  ],
})
export class LearnPage {
  readonly categoryService = inject(CategoryService);

  pool = signal<WordItem[]>([]);
  index = signal(0);
  flipped = signal(false);
  direction = signal<Direction>('hr-de');
  showDetails = signal(false);

  current = computed(() => this.pool()[this.index()]);
  progress = computed(() => {
    const total = this.pool().length;
    return total ? (this.index() + 1) / total : 0;
  });

  constructor() {
    addIcons({ arrowBack, arrowForward, refresh, swapHorizontal, checkmarkCircle, checkmarkCircleOutline, informationCircleOutline, informationCircleSharp });

    effect(() => {
      const items = this.categoryService.items();
      this.categoryService.lessonIds(); // track lesson changes
      untracked(() => this.rebuildPool(items));
    });
  }

  ionViewWillEnter() {
    this.rebuildPool(this.categoryService.items());
  }

  private rebuildPool(items: WordItem[]) {
    const forLesson = this.categoryService.itemsForLessons(items);
    const active = this.categoryService.activeOnly(forLesson);
    this.pool.set(this.categoryService.shuffle(active));
    this.index.set(0);
    this.flipped.set(false);
  }

  private readonly FLIP_MS = 600;
  private touchStartX = 0;
  private touchStartY = 0;
  private didSwipe = false;

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.didSwipe = false;
  }

  onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) {
      this.didSwipe = true;
      if (dx < 0) this.next();
      else this.prev();
    }
  }

  flip() {
    if (this.didSwipe) {
      this.didSwipe = false;
      return;
    }
    this.flipped.update(f => !f);
  }

  next() {
    this.advance(() => {
      this.showDetails.set(false);
      this.index.update(i => Math.min(i + 1, this.pool().length - 1));
    });
  }

  prev() {
    this.advance(() => {
      this.showDetails.set(false);
      this.index.update(i => Math.max(i - 1, 0));
    });
  }

  private advance(move: () => void) {
    if (this.flipped()) {
      this.flipped.set(false);
      setTimeout(move, this.FLIP_MS);
    } else {
      move();
    }
  }

  markKnown() {
    const item = this.current();
    if (!item) return;
    this.advance(() => {
      this.showDetails.set(false);
      this.categoryService.toggleKnown(item.id);
      const pool = this.pool();
      const idx = this.index();
      const newPool = pool.filter((_, i) => i !== idx);
      this.pool.set(newPool);
      if (newPool.length > 0) {
        this.index.set(Math.min(idx, newPool.length - 1));
      }
    });
  }

  reshuffle() {
    this.rebuildPool(this.categoryService.items());
  }

  swapDirection(value: Direction) {
    this.direction.set(value);
    this.flipped.set(false);
  }

  frontText(v: WordItem): string {
    return this.direction() === 'hr-de' ? v.hr : v.de;
  }

  backText(v: WordItem): string {
    return this.direction() === 'hr-de' ? v.de : v.hr;
  }
}
