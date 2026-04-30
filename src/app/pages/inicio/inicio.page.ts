import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonMenuButton, IonSearchbar, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, heart, bookmarkOutline, bookmark, filmOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { Pelicula } from '../../common/interfaces';
import { FiltroPipe } from '../../pipes/filtro-pipe';
import {SessionService} from "../../services/session.service";

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonMenuButton, IonSearchbar, IonIcon,
    FiltroPipe,
  ],
})
export class InicioPage implements OnInit, OnDestroy {
  @ViewChild('slider') sliderRef!: ElementRef<HTMLDivElement>;

  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);

  peliculaList: Pelicula[] = [];
  textoBuscar: string = '';
  favs: Set<string> = new Set();
  watchlist: Set<string> = new Set();
  userInitial: string = '';
  activeBanner: number = 0;
  private bannerInterval: any;

  banners: string[] = [
    'assets/images/bannerTFG_1.png',
    'assets/images/bannerTFG_2.png',
    'assets/images/bannerTFG_3.png',
  ];

  constructor() {
    addIcons({ heartOutline, heart, bookmarkOutline, bookmark, filmOutline });
  }

  ngOnInit() {
    this.sessionService.email$.subscribe(email => {
      this.userInitial = email ? email.charAt(0).toUpperCase() : 'U';
    });
    this.loadPeliculas();
    this.loadFavsYWatchlist();
    this.startBannerAuto();
  }

  ngOnDestroy() {
    clearInterval(this.bannerInterval);
  }

  private loadFavsYWatchlist() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.dataService.getFavs(userId).subscribe({
      next: (data) => data.favs.forEach((p: any) => this.favs.add(p._id)),
      error: (err) => console.error(err)
    });

    this.dataService.getWatchlist(userId).subscribe({
      next: (data) => data.watchlist.forEach((p: any) => this.watchlist.add(p._id)),
      error: (err) => console.error(err)
    });
  }

  private loadPeliculas() {
    this.dataService.getPeliculasData().subscribe({
      next: (data) => {
        this.peliculaList = data.message;
      },
      error: (err) => console.error(err)
    });
  }

  buscar(event: any) {
    this.textoBuscar = event.detail.value;
  }

  toggleFav(id: string) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.dataService.toggleFav(userId, id).subscribe({
      next: (data) => {
        this.favs = new Set(data.favs.map((p: any) => p._id ?? p));
      },
      error: (err) => console.error(err)
    });
  }

  toggleWatchlist(id: string) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.dataService.toggleWatchlist(userId, id).subscribe({
      next: (data) => {
        this.watchlist = new Set(data.watchlist.map((p: any) => p._id ?? p));
      },
      error: (err) => console.error(err)
    });
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle-pelicula', id]);
  }

  private startBannerAuto() {
    // 4 segundos entre slides
    this.bannerInterval = setInterval(() => {
      this.activeBanner = (this.activeBanner + 1) % this.banners.length;
      // Mover el slider al slide activo
      if (this.sliderRef) {
        const slideWidth = this.sliderRef.nativeElement.clientWidth;
        this.sliderRef.nativeElement.scrollLeft = slideWidth * this.activeBanner;
      }
    }, 4000);
  }

  irAPerfil() {
    this.router.navigate(['/perfil']);
  }
}
