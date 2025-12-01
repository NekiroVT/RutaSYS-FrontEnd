import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators'; // ⬅️ Nuevo: Para atrapar errores en el stream
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Interceptor para añadir el token JWT y manejar los errores de autenticación (401).
 * Centraliza la lógica de deslogueo por token expirado/inválido.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  // 1. Añadir el token a la cabecera
  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Manejar la respuesta (atrapar errores)
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // ⬅️ CLAVE: Manejo centralizado del 401 (sesión expirada)
      if (error.status === 401) {
        console.warn('HTTP 401 capturado por Interceptor: Sesión expirada/inválida. Forzando logout.');
        authService.logout();
        router.navigate(['/login']);
        // Retorna un error observable vacío para detener la ejecución del componente
        return throwError(() => new Error('Sesión expirada. Redirigiendo a login.'));
      } 
      
      // Para cualquier otro error (500, 404, error de red, etc.), simplemente lo propagamos.
      return throwError(() => error);
    })
  );
};