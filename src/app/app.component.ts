import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
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
  ToastController,
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
  downloadOutline,
  downloadSharp,
  cloudUploadOutline,
  cloudUploadSharp,
} from 'ionicons/icons';
import { CategoryService } from './services/category.service';
import { Category } from './services/word.types';
import { StateExportService } from './services/state-export.service';

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
  private readonly stateExportService = inject(StateExportService);
  private readonly toastCtrl = inject(ToastController);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public appPages = [
    { title: 'Lernen', url: '/learn', icon: 'school' },
    { title: 'Quiz', url: '/quiz', icon: 'help-circle' },
    { title: 'Tippen', url: '/type', icon: 'create' },
    { title: 'Wortliste', url: '/list', icon: 'list' },
  ];

  constructor() {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false });
    }

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
      downloadOutline,
      downloadSharp,
      cloudUploadOutline,
      cloudUploadSharp,
    });
  }

  setCategory(cat: Category): void {
    this.categoryService.setCategory(cat);
  }

  exportState(): void {
    this.stateExportService.exportState();
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    try {
      await this.stateExportService.importState(file);
      const toast = await this.toastCtrl.create({
        message: 'Lernstand erfolgreich importiert',
        duration: 2500,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
    } catch {
      const toast = await this.toastCtrl.create({
        message: 'Import fehlgeschlagen – ungültige Datei',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }
}
