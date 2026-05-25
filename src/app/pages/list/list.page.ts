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
  IonIcon, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  checkmarkCircleOutline,
  chevronDown,
} from 'ionicons/icons';
import { Adjective, Noun, WordItem } from '../../services/word.types';
import { Verb } from '../../services/verb.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  imports: [IonFooter, 
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
  readonly categoryService = inject(CategoryService);

  query = signal('');
  expandedId = signal<number | null>(null);

  lessonItems = computed(() =>
    this.categoryService.itemsForLessons(this.categoryService.items())
  );

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.lessonItems();
    if (!q) return items;
    return items.filter(
      v => v.de.toLowerCase().includes(q) || v.hr.toLowerCase().includes(q)
    );
  });

  constructor() {
    addIcons({ checkmarkCircle, checkmarkCircleOutline, chevronDown });
  }

  ngOnInit() {
    this.expandedId.set(null);
  }

  ionViewWillEnter() {
    this.expandedId.set(null);
  }

  onSearch(event: CustomEvent) {
    this.query.set((event.detail.value ?? '') as string);
  }

  toggleExpand(id: number) {
    this.expandedId.update(cur => (cur === id ? null : id));
  }

  toggleKnown(event: Event, id: number) {
    event.stopPropagation();
    this.categoryService.toggleKnown(id);
  }

  asVerb(item: WordItem): Verb {
    return item as Verb;
  }

  asAdjective(item: WordItem): Adjective {
    return item as Adjective;
  }

  asNoun(item: WordItem): Noun {
    return item as Noun;
  }

}
