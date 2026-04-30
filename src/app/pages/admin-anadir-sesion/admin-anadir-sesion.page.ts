import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';
import { Pelicula } from '../../common/interfaces';

@Component({
  selector: 'app-admin-anadir-sesion',
  templateUrl: './admin-anadir-sesion.page.html',
  styleUrls: ['./admin-anadir-sesion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, HeaderComponent],
})
export class AdminAnadirSesionPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  // Lista completa de películas
  todasPeliculas: Pelicula[] = [];
  peliculasFiltradas: Pelicula[] = [];
  peliculaSeleccionada: Pelicula | null = null;
  busqueda = '';
  horaInput = '';
  guardando = false;
  hoy = new Date().toISOString().split('T')[0];

  form = {
    movieId: '',
    sala: '',
    fecha: '',
    hora: [] as string[],
    precio: {
      adulto: 7.00,
      reducido: 6.50,
      jubilado: 5.90,
    },
    asientos: [] as boolean[][], // se genera automáticamente en backend
  };

  constructor() {
    addIcons({ addOutline, closeOutline });
  }

  ngOnInit() {
    this.dataService.getPeliculasData().subscribe({
      next: (data) => { this.todasPeliculas = data.message; },
      error: (err) => console.error(err)
    });
  }

  filtrarPeliculas() {
    if (!this.busqueda.trim()) {
      this.peliculasFiltradas = [];
      return;
    }
    const texto = this.busqueda.toLowerCase();
    this.peliculasFiltradas = this.todasPeliculas.filter(p =>
      p.titulo.toLowerCase().includes(texto)
    );
  }

  seleccionarPelicula(p: Pelicula) {
    this.peliculaSeleccionada = p;
    this.form.movieId = p._id;
    this.peliculasFiltradas = [];
    this.busqueda = '';
  }

  cambiarPelicula() {
    this.peliculaSeleccionada = null;
    this.form.movieId = '';
  }

  addHora() {
    if (!this.horaInput) return;
    if (this.form.hora.includes(this.horaInput)) {
      this.toastService.mostrarToast('Esa hora ya está añadida', 'warning');
      return;
    }
    this.form.hora.push(this.horaInput);
    this.form.hora.sort(); // ordenar cronológicamente
    this.horaInput = '';
  }

  removeHora(hora: string) {
    this.form.hora = this.form.hora.filter(h => h !== hora);
  }

  async guardar() {
    if (!this.validar()) return;
    this.guardando = true;

    this.dataService.addSesion(this.form).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Sesión añadida correctamente', 'success');
        this.router.navigate(['/admin-inicio']);
      },
      error: async () => {
        await this.toastService.mostrarToast('Faltan datos por rellenar', 'danger');
        this.guardando = false;
      }
    });
  }

  private async validar(): Promise<boolean> {
    if (!this.form.movieId) {
      await this.toastService.mostrarToast('Selecciona una película', 'warning');
      return false;
    }
    if (!this.form.sala.trim()) {
      await this.toastService.mostrarToast('La sala es obligatoria', 'warning');
      return false;
    }
    if (!this.form.fecha) {
      await this.toastService.mostrarToast('La fecha es obligatoria', 'warning');
      return false;
    }
    if (this.form.hora.length === 0) {
      await this.toastService.mostrarToast('Añade al menos un horario', 'warning');
      return false;
    }
    return true;
  }

  cancelar() {
    this.router.navigate(['/admin-inicio']);
  }
}
