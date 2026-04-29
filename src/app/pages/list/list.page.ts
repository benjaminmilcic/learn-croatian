import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  checkmarkCircleOutline,
  chevronDown,
} from 'ionicons/icons';
import { Verb, VerbService } from '../../services/verb.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonIcon,
  ],
})
export class ListPage implements OnInit {
  readonly verbService = inject(VerbService);

  private allVerbs = signal<Verb[]>([]);
  query = signal('');
  expandedId = signal<number | null>(null);

  lessonVerbs = computed(() => this.verbService.verbsForLessons(this.allVerbs()));

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const verbs = this.lessonVerbs();
    if (!q) return verbs;
    return verbs.filter(
      (v) =>
        v.de.toLowerCase().includes(q) || v.hr.toLowerCase().includes(q),
    );
  });

  constructor() {
    addIcons({ checkmarkCircle, checkmarkCircleOutline, chevronDown });
  }

  ngOnInit() {
    this.verbService.getVerbs().subscribe((v) => this.allVerbs.set(v));
  }

  onSearch(event: CustomEvent) {
    this.query.set((event.detail.value ?? '') as string);
  }

  toggleExpand(id: number) {
    this.expandedId.update((cur) => (cur === id ? null : id));
  }

  toggleKnown(event: Event, id: number) {
    event.stopPropagation();
    this.verbService.toggleKnown(id);
  }
}
