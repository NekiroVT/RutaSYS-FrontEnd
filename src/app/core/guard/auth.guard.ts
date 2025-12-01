import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guarda de autenticación para proteger rutas.
 * Solo permite el acceso si el usuario tiene un token válido.
 * Si el token no existe, redirige al usuario a la página de login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // 1. Verificar si existe un token (usando el método actualizado de AuthService)
  const token = authService.obtenerToken();

  if (token) {
    // El token existe, el acceso a la ruta está permitido.
    return true;
  } else {
    // El token no existe, redirigir al login y bloquear la navegación.
    console.warn('Acceso denegado: Token no encontrado. Redirigiendo a /login.');
    router.navigate(['/login']);
    return false;
  }
};