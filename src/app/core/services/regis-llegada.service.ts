import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { REGISTRO_LLEGADA_API_URL } from '../../../environments/api'; 
import { AuthService } from './auth.service'; // Asumiendo que existe el AuthService

// --------------------------------------------------------------------------------
// INTERFACES DEL BACKEND (Basado en tus DTOs de Java)
// --------------------------------------------------------------------------------

// DTO de Estado de Asistencia (Mapea AsistenciaEstadoDTO.java)
export interface AsistenciaEstado {
    estadoDominante: 'PRESENTE' | 'ACTIVO' | 'NO_INICIADO' | 'FALTO' | 'NO_ASIGNADO' | string;
    idManifiestoVehiculoDisparador: number | null; 
    idVehiculoAsignado: number | null;
}

// DTO de Requerimiento (Mapea RegistroLlegadaChoferRegisterRequestDTO)
export interface RegistroLlegadaRequest {
    idManifiestoVehiculo: number; 
    idChofer: number; // ⬅️ Este ID lo obtendremos del servicio de Auth
    ubicacionTexto: string;
    latitud: number;
    longitud: number;
    fotoEvidencia: string | null; 
    estadoLlegada?: string; 
}

// DTO de Respuesta (Mapea RegistroLlegadaChoferDTO)
export interface RegistroLlegadaResponseDTO {
    id: number;
    fechaHoraLlegada: string; 
    manifiestoVehiculoId: number;
    choferNombreCompleto: string;
    estadoLlegada: string;
    // ... otros campos
}

// Interfaz para la respuesta estructurada de tu backend (ApiResponseDTO)
export interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    success: boolean;
}


@Injectable({
    providedIn: 'root'
})
export class RegistrarLlegadaService { 
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    
    private getHeaders(): HttpHeaders {
        const token = this.authService.obtenerToken(); // Usamos obtenerToken() de tu AuthService
        
        if (!token) {
            console.error('No se encontró token de autenticación.');
            throw new Error('No autenticado');
        }

        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * ❌ ELIMINADO: Este método es redundante y se mueve a AuthService.
     * getChoferIdFromToken(): number | null { ... }
     */

    // -------------------------------------------------------------------------
    // 1. CONSULTA DE ESTADO DE ASISTENCIA
    // -------------------------------------------------------------------------

    /**
     * Consulta el estado de asistencia actual del chofer (ACTIVO, PRESENTE, etc.).
     * @param choferId ID del Chofer (entidadId del token, obtenido del AuthService).
     * @returns Observable con el estado dominante y el ID del disparador si está ACTIVO.
     */
    obtenerEstadoAsistencia(choferId: number): Observable<ApiResponse<AsistenciaEstado>> {
        const url = `${REGISTRO_LLEGADA_API_URL}/estado/${choferId}`;
        return this.http.get<ApiResponse<AsistenciaEstado>>(url, { headers: this.getHeaders() });
    }

    // -------------------------------------------------------------------------
    // 2. REGISTRO DE LLEGADA (Disparador de la acción masiva)
    // -------------------------------------------------------------------------
    
    /**
     * Registra la llegada del chofer al almacén (dispara la actualización masiva a PRESENTE).
     * @param data Los datos de la llegada (IDs, ubicación, hora).
     * @returns Un Observable con la respuesta del backend.
     */
    registrarLlegada(data: RegistroLlegadaRequest): Observable<ApiResponse<RegistroLlegadaResponseDTO>> {
        
        return this.http.post<ApiResponse<RegistroLlegadaResponseDTO>>(REGISTRO_LLEGADA_API_URL, data, { headers: this.getHeaders() });
    }

    // -------------------------------------------------------------------------
    // 3. OPERACIÓN ADMINISTRATIVA: Habilitar Asistencia
    // -------------------------------------------------------------------------
    
    /**
     * Habilita la asistencia para un vehículo (cambia NO_INICIADO a ACTIVO).
     * @param idManifiestoVehiculo ID de cualquier asignación del vehículo a habilitar.
     */
    habilitarAsistencia(idManifiestoVehiculo: number): Observable<ApiResponse<void>> {
        const url = `${REGISTRO_LLEGADA_API_URL}/habilitar/${idManifiestoVehiculo}`;
        return this.http.post<ApiResponse<void>>(url, {}, { headers: this.getHeaders() });
    }
}