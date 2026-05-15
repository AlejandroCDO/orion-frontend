import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonIcon, IonRefresher, IonRefresherContent} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmarkOutline, filmOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.page.html',
  styleUrls: ['./watchlist.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeaderComponent, IonRefresher, IonRefresherContent],
})
export class WatchlistPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);

  watchlist: any[] = [];
  cargando = true;

  constructor() {
    addIcons({ bookmarkOutline, filmOutline });
  }

  ngOnInit() {
    this.cargarWatchlist();
  }
  ionViewWillEnter() {
    this.cargarWatchlist();
  }

  private cargarWatchlist() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.cargando = true;
    this.dataService.getWatchlist(userId).subscribe({
      next: (data) => {
        this.watchlist = data.watchlist;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  recargar(event: any) {
    this.cargarWatchlist();
    setTimeout(() => event.target.complete(), 1000);
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle-pelicula', id]);
  }
}
