import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { ToastService } from '../../services/toast-service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonFooter, IonIcon, HeaderComponent],
})
export class PagoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly toastService = inject(ToastService);

  sala: string = '';
  sessionId: string = '';
  movieTitulo: string = '';
  moviePoster: string = '';
  hora: string = '';
  fecha: string = '';
  total: string = '';
  asientos: string[] = [];
  entradas: any[] = [];
  pagando: boolean = false;

  constructor() {
    addIcons({ cardOutline });
  }

  ngOnInit() {
    const q = this.route.snapshot.queryParams;
    this.sessionId  = q['sessionId'] ?? '';
    this.sala = q['sala'] ?? '';
    this.movieTitulo = q['movieTitulo'] ?? '';
    this.moviePoster = q['moviePoster'] ?? '';
    this.hora       = q['hora'] ?? '';
    this.fecha      = q['fecha'] ?? '';
    this.total      = q['total'] ?? '0.00';
    this.asientos   = JSON.parse(q['asientos'] ?? '[]');
    this.entradas   = JSON.parse(q['entradas'] ?? '[]');
  }

  async confirmarPago() {
    this.pagando = true;

    const usuarioId = localStorage.getItem('userId');
    if (!usuarioId) {
      await this.toastService.mostrarToast('Error de sesión, vuelve a iniciar sesión', 'danger');
      this.pagando = false;
      return;
    }

    const body = {
      usuarioId,
      sesionId: this.sessionId,
      horaElegida: this.hora,
      entradas: {
        adulto:   this.getCantidad('Adulto'),
        reducido: this.getCantidad('Reducida'),
        jubilado: this.getCantidad('Jubilado'),
      },
      asientosSeleccionados: this.asientos,
      totalPagado: parseFloat(this.total),
    };

    this.dataService.crearReserva(body).subscribe({
      next: async () => {
        await this.toastService.mostrarToast('¡Reserva confirmada!', 'success');
        this.router.navigate(['/inicio']);
      },
      error: async (err) => {
        const msg = err?.error?.message || 'Error al procesar el pago';
        await this.toastService.mostrarToast(msg, 'danger');
        this.pagando = false;
      }
    });
  }

  private getCantidad(nombre: string): number {
    return this.entradas.find((e: any) => e.nombre === nombre)?.cantidad ?? 0;
  }
}
