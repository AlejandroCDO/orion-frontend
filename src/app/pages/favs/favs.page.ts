import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonContent, IonIcon, IonRefresher, IonRefresherContent} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, filmOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-favs',
  templateUrl: './favs.page.html',
  styleUrls: ['./favs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, HeaderComponent, IonRefresher, IonRefresherContent],
})
export class FavsPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);

  favs: any[] = [];
  cargando = true;

  constructor() {
    addIcons({ heartOutline, filmOutline });
  }

  ngOnInit() {
    this.cargarFavs();
  }
  ionViewWillEnter() {
    this.cargarFavs();
  }

  private cargarFavs() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.cargando = true;
    this.dataService.getFavs(userId).subscribe({
      next: (data) => {
        this.favs = data.favs;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }
  recargar(event: any) {
    this.cargarFavs();
    setTimeout(() => event.target.complete(), 1000);
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle-pelicula', id]);
  }
}
