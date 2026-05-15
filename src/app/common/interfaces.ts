export interface ApiResponsePeliculas {
  status: number;
  message: Pelicula[];
}

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

export interface ApiResponseUnaPelicula {
  status: boolean;
  pelicula: Pelicula;
}

export interface ApiResponseLogin {
  status: boolean;
  token: string;
  role: 'client' | 'admin';
}

export interface ApiResponseRegister {
  status: boolean;
  message: string;
}

export interface UserSession {
  token: string;
  role: 'client' | 'admin';
  userId: string;
}
