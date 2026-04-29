
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
} from 'ionicons/icons';
import { VerbService } from './services/verb.service';

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
  readonly verbService = inject(VerbService);

  public appPages = [
    { title: 'Lernen', url: '/learn', icon: 'school' },
    { title: 'Quiz', url: '/quiz', icon: 'help-circle' },
    { title: 'Alle Verben', url: '/list', icon: 'list' },
  ];

  readonly lessons = [1, 2, 3];

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
    });
  }
}
