import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFooter } from '@ionic/angular/standalone';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-butacas',
  templateUrl: './butacas.page.html',
  styleUrls: ['./butacas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonFooter, HeaderComponent],
})
export class ButacasPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);

  sala: string = '';
  sesion: any = null;
  asientos: boolean[][] = [];
  asientosSeleccionados: string[] = [];
  horaSeleccionada: string = '';
  fechaFormateada: string = '';
  totalEntradas: number = 0;
  entradasData: any[] = [];

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    this.horaSeleccionada = this.route.snapshot.queryParams['hora'] ?? '';
    this.sala = this.route.snapshot.queryParams['sala'] ?? '';

    // Recuperar cuántas entradas eligió el usuario
    const entradasParam = this.route.snapshot.queryParams['entradas'];
    if (entradasParam) {
      this.entradasData = JSON.parse(entradasParam);
      this.totalEntradas = this.entradasData.reduce(
        (sum: number, e: any) => sum + e.cantidad, 0
      );
    }

    if (sessionId) {
      this.dataService.getSessionById(sessionId).subscribe({
        next: (data) => {
          this.sesion = data.session;
          this.asientos = data.session.asientos;
          this.fechaFormateada = this.formatearFecha(data.session.fecha);
        },
        error: (err) => console.error(err)
      });
    }
  }

  getLetraFila(index: number): string {
    return String.fromCharCode(65 + index);
  }

  isSeleccionado(fila: number, columna: number): boolean {
    const codigo = `${this.getLetraFila(fila)}${columna + 1}`;
    return this.asientosSeleccionados.includes(codigo);
  }

  toggleAsiento(fila: number, columna: number) {
    const codigo = `${this.getLetraFila(fila)}${columna + 1}`;
    const idx = this.asientosSeleccionados.indexOf(codigo);

    if (idx >= 0) {
      // Deseleccionar
      this.asientosSeleccionados.splice(idx, 1);
    } else {
      // Seleccionar — no más de los que ha comprado
      if (this.asientosSeleccionados.length >= this.totalEntradas) {
        this.toastService.mostrarToast(
          `Solo puedes seleccionar ${this.totalEntradas} asiento(s)`, 'warning'
        );
        return;
      }
      this.asientosSeleccionados.push(codigo);
    }
  }

  async irAPago() {
    if (this.asientosSeleccionados.length !== this.totalEntradas) {
      await this.toastService.mostrarToast('Selecciona todos los asientos', 'warning');
      return;
    }

    this.router.navigate(['/pago'], {
      queryParams: {
        sessionId: this.sesion._id,
        sala: this.sala,
        asientos: JSON.stringify(this.asientosSeleccionados),
        entradas: JSON.stringify(this.entradasData),
        hora: this.horaSeleccionada,
        fecha: this.fechaFormateada,
        movieTitulo: this.sesion.movieId?.titulo,
        moviePoster: this.sesion.movieId?.posterURL,
        total: this.entradasData.reduce(
          (sum: number, e: any) => sum + e.precio * e.cantidad, 0
        ).toFixed(2)
      }
    });
  }

  private formatearFecha(fechaISO: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles',
      'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date(fechaISO);
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
  }
}
