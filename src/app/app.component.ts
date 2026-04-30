import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar,
  IonContent, IonList, IonItem, IonLabel,
  IonIcon, MenuController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filmOutline, ticketOutline, logOutOutline,
  heartOutline, bookmarkOutline, personOutline, calendarOutline, peopleOutline, chatbubbleOutline
} from 'ionicons/icons';
import { DataService } from './services/data-service';
import {SessionService} from "./services/session.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonMenu, IonHeader, IonToolbar,
    IonContent, IonList, IonItem, IonLabel, IonIcon],
})
export class AppComponent {
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  private dataService = inject(DataService);
  private sessionService = inject(SessionService);

  userInitial: string = '';
  userEmail: string = '';
  role: string = '';

  constructor() {
    addIcons({ filmOutline, ticketOutline, logOutOutline,
      heartOutline, bookmarkOutline, personOutline,
      peopleOutline, calendarOutline, chatbubbleOutline  });

    // Suscripción al email
    this.sessionService.email$.subscribe(email => {
      this.userEmail = email;
      this.userInitial = email ? email.charAt(0).toUpperCase() : '';
    });

    // Suscripción al role
    this.sessionService.role$.subscribe(role => {
      this.role = role;
    });
  }

  async navegar(ruta: string) {
    await this.menuCtrl.close();
    this.router.navigate([ruta]);
  }

  async cerrarSesion() {
    await this.menuCtrl.close();
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }
}
