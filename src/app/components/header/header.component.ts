import { Component, Input, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { SessionService } from '../../services/session.service';
import {
  IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
})
export class HeaderComponent implements OnInit {
  @Input() titulo: string = 'ORION';
  @Input() backUrl: string = '/inicio';

  private sessionService = inject(SessionService);
  userInitial: string = 'U';

  ngOnInit() {
    this.sessionService.email$.subscribe(email => {
      this.userInitial = email ? email.charAt(0).toUpperCase() : 'U';
    });
  }
}
