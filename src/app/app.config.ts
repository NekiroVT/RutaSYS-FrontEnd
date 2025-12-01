import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// ⬅️ ¡NUEVA IMPORTACIÓN CLAVE!
import { provideHttpClient } from '@angular/common/http'; 
import { routes } from './app.routes'; 

export const appConfig: ApplicationConfig = {
  providers: [
    // ⬅️ ¡AGREGAR ESTA LÍNEA! Esto hace que HttpClient esté disponible
    provideHttpClient(), 
    
    // Rutas (ya lo tenías)
    provideRouter(routes), 
    // ... otros providers aquí 
  ],
};