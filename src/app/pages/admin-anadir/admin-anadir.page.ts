import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-admin-anadir',
  templateUrl: './admin-anadir.page.html',
  styleUrls: ['./admin-anadir.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, HeaderComponent],
})
export class AdminAnadirPage {
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

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

    this.dataService.addPelicula(this.form).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('Película añadida correctamente', 'success');
        this.router.navigate(['/admin-inicio']);
      },
      error: async () => {
        const msg = 'Faltan datos de la película';
        await this.toastService.mostrarToast(msg, 'danger');
        this.guardando = false;
      }
    });
  }

  private async validar(): Promise<boolean> {
    if (!this.form.titulo.trim()) {
      await this.toastService.mostrarToast('El título es obligatorio', 'warning');
      return false;
    }
    if (!this.form.sinopsis.trim()) {
      await this.toastService.mostrarToast('La sinopsis es obligatoria', 'warning');
      return false;
    }
    if (!this.form.posterURL.trim()) {
      await this.toastService.mostrarToast('La URL del póster es obligatoria', 'warning');
      return false;
    }
    if (!this.form.director.trim()) {
      await this.toastService.mostrarToast('El director es obligatorio', 'warning');
      return false;
    }
    if (!this.generosTexto.trim()) {
      await this.toastService.mostrarToast('Añade al menos un género', 'warning');
      return false;
    }
    if (!this.form.clasEdad) {
      await this.toastService.mostrarToast('Selecciona la clasificación por edad', 'warning');
      return false;
    }
    return true;
  }

  cancelar() {
    this.router.navigate(['/admin-inicio']);
  }
}
