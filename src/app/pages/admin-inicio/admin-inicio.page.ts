import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonMenuButton, IonSearchbar, IonIcon, IonFab, IonFabButton,
  IonFabList, AlertController, IonLabel, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, filmOutline,
  calendarOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { Pelicula } from '../../common/interfaces';
import { FiltroPipe } from '../../pipes/filtro-pipe';
import {SessionService} from "../../services/session.service";

@Component({
  selector: 'app-admin-inicio',
  templateUrl: './admin-inicio.page.html',
  styleUrls: ['./admin-inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonMenuButton, IonSearchbar, IonIcon, IonFab, IonFabButton,
    IonFabList, FiltroPipe, IonRefresher, IonRefresherContent
  ],
})
export class AdminInicioPage implements OnInit, OnDestroy {
  @ViewChild('slider') sliderRef!: ElementRef<HTMLDivElement>;

  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  private readonly sessionService = inject(SessionService);

  peliculaList: Pelicula[] = [];
  textoBuscar: string = '';
  userInitial: string = '';
  activeBanner: number = 0;
  private bannerInterval: any;

  banners: string[] = [
    'assets/images/bannerTFG_1.png',
    'assets/images/bannerTFG_2.png',
    'assets/images/bannerTFG_3.png',
  ];

  constructor() {
    addIcons({ add, createOutline, trashOutline, filmOutline, calendarOutline });
  }

  ngOnInit() {
    this.sessionService.email$.subscribe(email => {
      this.userInitial = email ? email.charAt(0).toUpperCase() : 'U';
    });
    this.loadPeliculas();
    this.startBannerAuto();
  }

  ionViewWillEnter() {
    this.loadPeliculas();
  }

  ngOnDestroy() {
    clearInterval(this.bannerInterval);
  }

  private loadPeliculas() {
    this.dataService.getPeliculasData().subscribe({
      next: (data) => { this.peliculaList = data.message; },
      error: (err) => console.error(err)
    });
  }

  buscar(event: any) {
    this.textoBuscar = event.detail.value;
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle-pelicula', id]);
  }

  editarPelicula(id: string) {
    this.router.navigate(['/admin-editar', id]);
  }

  async eliminarPelicula(id: string, titulo: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar película',
      message: `¿Seguro que quieres eliminar "${titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.dataService.deletePelicula(id).subscribe({
              next: async () => {
                await this.toastService.mostrarToast('Película eliminada', 'success');
                this.loadPeliculas();
              },
              error: async () => {
                await this.toastService.mostrarToast('Error al eliminar', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  irAAnadirPelicula() {
    this.router.navigate(['/admin-anadir']);
  }

  irAAnadirSesion() {
    this.router.navigate(['/admin-anadir-sesion']);
  }

  private startBannerAuto() {
    this.bannerInterval = setInterval(() => {
      this.activeBanner = (this.activeBanner + 1) % this.banners.length;
      if (this.sliderRef) {
        const w = this.sliderRef.nativeElement.clientWidth;
        this.sliderRef.nativeElement.scrollLeft = w * this.activeBanner;
      }
    }, 4000);
  }
  irAPerfil() {
    this.router.navigate(['/perfil']);
  }
  recargar(event: any) {
    this.loadPeliculas(); // o el métodoo de carga que tenga cada página
    setTimeout(() => event.target.complete(), 1000);
  }
  readonly yearActual = new Date().getFullYear();

  get estrenos(): Pelicula[] {
    return this.peliculaList.filter(p => p.year === this.yearActual);
  }

  get reestrenos(): Pelicula[] {
    return this.peliculaList.filter(p => p.year < this.yearActual);
  }
}
