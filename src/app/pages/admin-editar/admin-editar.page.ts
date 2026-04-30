import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-admin-editar',
  templateUrl: './admin-editar.page.html',
  styleUrls: ['./admin-editar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, HeaderComponent],
})
export class AdminEditarPage implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  peliculaId = '';
  guardando = false;
  posterURL = '';
  generosTexto = '';
  edades = ['+0', '+7', '+12', '+16', '+18'];

  form = {
    titulo: '',
    sinopsis: '',
    posterURL: '',
    year: new Date().getFullYear(),
    duracion: '',
    director: '',
    genres: [] as string[],
    clasEdad: '',
  };

  constructor() {
    addIcons({ imageOutline });
  }

  ngOnInit() {
    this.peliculaId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.peliculaId) {
      this.dataService.getPeliculaById(this.peliculaId).subscribe({
        next: (data) => {
          const p = data.pelicula;
          this.form = {
            titulo: p.titulo,
            sinopsis: p.sinopsis,
            posterURL: p.posterURL,
            year: p.year,
            duracion: p.duracion,
            director: p.director,
            genres: p.genres,
            clasEdad: p.clasEdad,
          };
          this.posterURL = p.posterURL;
          this.generosTexto = p.genres.join(', ');
        },
        error: (err) => console.error(err)
      });
    }
  }

  onPosterChange() {
    this.posterURL = this.form.posterURL;
  }

  async guardar() {
    if (!this.validar()) return;

    this.form.genres = this.generosTexto
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    this.guardando = true;

    this.dataService.updatePelicula(this.peliculaId, this.form).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Película actualizada correctamente', 'success');
        this.router.navigate(['/admin-inicio']);
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Error al actualizar la película';
        await this.toastService.mostrarToast(msg, 'danger');
        this.guardando = false;
      }
    });
  }

  private async validar(): Promise<boolean> {
    if (!this.form.titulo.trim()) {
      await this.toastService.mostrarToast('El título es obligatorio', 'warning'); return false;
    }
    if (!this.form.sinopsis.trim()) {
      await this.toastService.mostrarToast('La sinopsis es obligatoria', 'warning'); return false;
    }
    if (!this.form.posterURL.trim()) {
      await this.toastService.mostrarToast('La URL del póster es obligatoria', 'warning'); return false;
    }
    if (!this.form.director.trim()) {
      await this.toastService.mostrarToast('El director es obligatorio', 'warning'); return false;
    }
    if (!this.generosTexto.trim()) {
      await this.toastService.mostrarToast('Añade al menos un género', 'warning'); return false;
    }
    if (!this.form.clasEdad) {
      await this.toastService.mostrarToast('Selecciona la clasificación por edad', 'warning'); return false;
    }
    return true;
  }

  cancelar() {
    this.router.navigate(['/admin-inicio']);
  }
}
