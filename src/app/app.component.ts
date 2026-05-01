import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  school,
  schoolOutline,
  schoolSharp,
  helpCircle,
  helpCircleOutline,
  helpCircleSharp,
  listOutline,
  listSharp,
  createOutline,
  createSharp,
} from 'ionicons/icons';
import { CategoryService } from './services/category.service';
import { Category } from './services/word.types';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  readonly categoryService = inject(CategoryService);

  public appPages = [
    { title: 'Lernen', url: '/learn', icon: 'school' },
    { title: 'Quiz', url: '/quiz', icon: 'help-circle' },
    { title: 'Tippen', url: '/type', icon: 'create' },
    { title: 'Wortliste', url: '/list', icon: 'list' },
  ];

  constructor() {
    addIcons({
      school,
      schoolOutline,
      schoolSharp,
      helpCircle,
      helpCircleOutline,
      helpCircleSharp,
      listOutline,
      listSharp,
      createOutline,
      createSharp,
    });
  }

  setCategory(cat: Category): void {
    this.categoryService.setCategory(cat);
  }
}
