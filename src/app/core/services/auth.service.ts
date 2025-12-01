import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AUTH_API_URL } from '../../../environments/api';
import { jwtDecode } from 'jwt-decode';

interface LoginRequest {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

// Interfaz para el payload de tu token (estructura confirmada)
interface TokenPayload {
  usuarioId: number; 
  username: string; // Para el nombre de perfil
  rol: string;
  exp: number; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // CLAVES DE ALMACENAMIENTO LOCAL para el contexto de la sesión
  private readonly TOKEN_KEY = 'token';
  private readonly PROFILE_ID_KEY = 'profileId';
  private readonly PROFILE_ROLE_KEY = 'profileRole';
  private readonly PROFILE_IMAGE_KEY = 'profileImageUrl'; 
  private readonly PROFILE_NAME_KEY = 'profileName';

  login(username: string, password: string) {
    const body: LoginRequest = { username, password };
    return this.http.post<ApiResponse<string>>(`${AUTH_API_URL}/login`, body);
  }

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * ⬅️ MÉTODO AÑADIDO: Verifica si existe un token válido.
   */
  isAuthenticated(): boolean {
    const token = this.obtenerToken();
    // Podrías añadir aquí lógica de verificación de expiración (isTokenExpired)
    return !!token; 
  }

  decodeTokenPayload(): TokenPayload | null {
    const token = this.obtenerToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<TokenPayload>(token); 
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getCurrentUserId(): number | null {
    const payload = this.decodeTokenPayload();
    return payload?.usuarioId || null; 
  }

  setProfileContext(profileId: number, profileRole: string, profileImageUrl: string, profileName: string): void {
    localStorage.setItem(this.PROFILE_ID_KEY, profileId.toString());
    localStorage.setItem(this.PROFILE_ROLE_KEY, profileRole);
    localStorage.setItem(this.PROFILE_IMAGE_KEY, profileImageUrl); 
    localStorage.setItem(this.PROFILE_NAME_KEY, profileName);
  }

  getProfileId(): number | null {
    const id = localStorage.getItem(this.PROFILE_ID_KEY);
    return id ? parseInt(id, 10) : null;
  }
  
  getProfileRole(): string | null {
    return localStorage.getItem(this.PROFILE_ROLE_KEY);
  }

  getProfileImageUrl(): string | null {
    return localStorage.getItem(this.PROFILE_IMAGE_KEY);
  }
  
  getProfileName(): string | null {
    return localStorage.getItem(this.PROFILE_NAME_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.PROFILE_ID_KEY);
    localStorage.removeItem(this.PROFILE_ROLE_KEY);
    localStorage.removeItem(this.PROFILE_IMAGE_KEY);
    localStorage.removeItem(this.PROFILE_NAME_KEY);
  }
}