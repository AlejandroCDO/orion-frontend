export interface ApiResponsePeliculas {
  status: number;
  message: Pelicula[]; // Aquí es donde "mapeamos" el message a un array de Peliculas
}

// Esta interfaz representa el objeto de la película en sí
export interface Pelicula {
  _id: string;
  titulo: string;
  sinopsis: string;
  genres: string[];
  director: string;
  year: number;
  posterURL: string;
  duracion: string;
  clasEdad: '+0' | '+7' | '+12' | '+16' | '+18';
  mediaValoracion?: number;
  totalValoraciones?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Interfaz para cuando pides una sola película (ej: /unaPelicula/:id)
export interface ApiResponseUnaPelicula {
  status: boolean;
  pelicula: Pelicula;
}

// Respuesta del login
export interface ApiResponseLogin {
  status: boolean;
  token: string;
  role: 'client' | 'admin';
}

// Respuesta del register
export interface ApiResponseRegister {
  status: boolean;
  message: string;
}

// Lo que guardamos en localStorage tras el login
export interface UserSession {
  token: string;
  role: 'client' | 'admin';
  userId: string;
}
