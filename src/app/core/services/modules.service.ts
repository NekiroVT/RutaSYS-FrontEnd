import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// ✅ CORRECCIÓN 1: Se importa la constante directamente desde el archivo environment
import { MODULES_API_URL } from '../../../environments/api'; 
import { AuthService } from './auth.service'; // Necesario para obtener el JWT

// Definimos la interfaz del DTO que recibimos del backend DENTRO de este mismo archivo.
interface ModuleUserDTO {
    usuarioId: number;
    choferId: number | null;
    administradorId: number | null; 
    nombre: string;
    rol: string;
    route: string;
    imagenUrl: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ModulesDataService {
    
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    
    // ❌ Se elimina la propiedad local 'private MODULES_API_URL' que era redundante.
    
    /**
     * Obtiene la lista de perfiles/módulos disponibles para el usuario autenticado.
     * @returns Un Observable que emite la lista de ModuleUserDTO.
     */
    getAvailableModules(): Observable<ModuleUserDTO[]> {
        const token = this.authService.obtenerToken();

        if (!token) {
            // Si no hay token, devuelve un Observable vacío o lanza un error
            return new Observable(observer => {
                observer.next([]);
                observer.complete();
            });
        }

        const headers = new HttpHeaders({
            // El backend usa 'Authorization: Bearer <token>' para la seguridad
            'Authorization': `Bearer ${token}`
        });

        // ✅ CORRECCIÓN 2: Se usa la constante importada 'MODULES_API_URL' directamente.
        // GET -> /api/modules/users
        return this.http.get<ModuleUserDTO[]>(`${MODULES_API_URL}/users`, { headers });
    }
}