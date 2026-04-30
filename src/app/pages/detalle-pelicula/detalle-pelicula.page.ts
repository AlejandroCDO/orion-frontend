import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, locationOutline, star, starOutline, starHalf, trashOutline } from 'ionicons/icons';
import { DataService } from '../../services/data-service';
import { Pelicula } from '../../common/interfaces';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-detalle-pelicula',
  templateUrl: './detalle-pelicula.page.html',
  styleUrls: ['./detalle-pelicula.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSelect, IonSelectOption, HeaderComponent, IonIcon],
})
export class DetallePeliculaPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  pelicula: Pelicula | null = null;
  sesiones: any[] = [];
  diasDisponibles: { label: string; valor: string }[] = [];
  fechaSeleccionada: string = '';

  // Valoraciones
  valoraciones: any[] = [];
  miValoracion: any = null;
  estrellaSeleccionada: number = 0;
  estrellaHover: number = 0;
  comentario: string = '';
  guardandoValoracion: boolean = false;
  mostrarFormValoracion: boolean = false;
  readonly estrellas = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ chevronDownOutline, locationOutline, star, starOutline, starHalf, trashOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.generarDias(); // primero generamos los días
      this.cargarPelicula(id); // luego cargamos (ya tiene fechaSeleccionada)
      this.cargarValoraciones(id);
      this.cargarMiValoracion(id);
    }
  }

  private cargarPelicula(id: string) {
    this.dataService.getPeliculaById(id).subscribe({
      next: (data) => {
        this.pelicula = data.pelicula;
        this.cargarSesiones(id, this.fechaSeleccionada);
      },
      error: (err) => console.error(err)
    });
  }

  private cargarValoraciones(peliculaId: string) {
    this.dataService.getValoraciones(peliculaId).subscribe({
      next: (data) => { this.valoraciones = data.valoraciones; },
      error: (err) => console.error(err)
    });
  }

  private cargarMiValoracion(peliculaId: string) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    this.dataService.getMiValoracion(peliculaId, userId).subscribe({
      next: (data) => {
        if (data.valoracion) {
          this.miValoracion = data.valoracion;
          this.estrellaSeleccionada = data.valoracion.puntuacion;
          this.comentario = data.valoracion.comentario;
        }
      },
      error: (err) => console.error(err)
    });
  }

  guardarValoracion() {
    const peliculaId = this.route.snapshot.paramMap.get('id');
    const userId = localStorage.getItem('userId');
    if (!peliculaId || !userId || !this.estrellaSeleccionada) return;

    this.guardandoValoracion = true;
    this.dataService.crearOActualizarValoracion(
      peliculaId, userId, this.estrellaSeleccionada, this.comentario
    ).subscribe({
      next: (data) => {
        this.miValoracion = data.valoracion;
        this.mostrarFormValoracion = false;
        this.guardandoValoracion = false;
        this.cargarValoraciones(peliculaId);
        // Actualiza la media en la pelicula local
        if (this.pelicula) {
          this.dataService.getPeliculaById(peliculaId).subscribe({
            next: (d) => { this.pelicula = d.pelicula; }
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.guardandoValoracion = false;
      }
    });
  }

  eliminarValoracion() {
    const peliculaId = this.route.snapshot.paramMap.get('id');
    const userId = localStorage.getItem('userId');
    if (!peliculaId || !userId) return;

    this.dataService.eliminarValoracion(peliculaId, userId).subscribe({
      next: () => {
        this.miValoracion = null;
        this.estrellaSeleccionada = 0;
        this.comentario = '';
        this.mostrarFormValoracion = false;
        this.cargarValoraciones(peliculaId);
        if (this.pelicula) {
          this.dataService.getPeliculaById(peliculaId).subscribe({
            next: (d) => { this.pelicula = d.pelicula; }
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  abrirFormValoracion() {
    if (this.miValoracion) {
      this.estrellaSeleccionada = this.miValoracion.puntuacion;
      this.comentario = this.miValoracion.comentario;
    }
    this.mostrarFormValoracion = true;
  }

  getNombreUsuario(v: any): string {
    if (v.userId?.nombre) return `${v.userId.nombre} ${v.userId.apellidos || ''}`.trim();
    return v.userId?.email || 'Usuario';
  }

  getEstrellaIcon(estrella: number, media: number): string {
    if (media >= estrella) return 'star';
    if (media >= estrella - 0.5) return 'star-half';
    return 'star-outline';
  }

  private generarDias() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const hoy = new Date();

    for (let i = 0; i < 21; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const label = i === 0
        ? `Hoy, ${fecha.getDate()} de ${meses[fecha.getMonth()]}`
        : i === 1
          ? `Mañana, ${fecha.getDate()} de ${meses[fecha.getMonth()]}`
          : `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
      const valor = fecha.toISOString().split('T')[0];
      this.diasDisponibles.push({ label, valor });
    }
    this.fechaSeleccionada = this.diasDisponibles[0].valor;
  }

  onFechaChange() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarSesiones(id, this.fechaSeleccionada);
  }

  private cargarSesiones(movieId: string, fecha: string) {
    this.dataService.getSessionesByPelicula(movieId).subscribe({
      next: (data) => {
        this.sesiones = data.sessions.filter((s: any) => {
          const d = new Date(s.fecha);
          const fechaSesion = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return fechaSesion === fecha;
        });
      },
      error: (err) => console.error(err)
    });
  }

  irAEntradas(sessionId: string, hora: string, sala: string) {
    this.router.navigate(['/entradas', sessionId], {
      queryParams: { hora, sala }
    });
  }

  getSplitHoras(hora: any): string[] {
    if (!hora) return [];
    if (Array.isArray(hora)) return hora;
    if (typeof hora === 'string') return hora.split(',').map(h => h.trim());
    return [];
  }
}
