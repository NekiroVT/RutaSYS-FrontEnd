import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { 
    RegistrarLlegadaService, 
    AsistenciaEstado, 
    RegistroLlegadaRequest,
    ApiResponse // Importamos ApiResponse
} from '../../../core/services/regis-llegada.service'; 


// --------------------------------------------------------------------------------
// INTERFACES DEL COMPONENTE (Manejo de Geocodificación)
// --------------------------------------------------------------------------------
interface GeoAddress {
    address: {
        Match_addr: string; // Nombre corto o calle
        LongLabel: string; // Dirección completa y detallada
        City: string;
        CountryCode: string;
        District?: string; 
        Subregion?: string;
        Region?: string; 
        CntryName?: string;
    };
    location: {
        x: number; // Longitud
        y: number; // Latitud
    };
}

@Component({
    selector: 'app-regisllegada',
    standalone: true,
    imports: [CommonModule, FormsModule], 
    templateUrl: './regisllegada.component.html',
    styleUrl: './regisllegada.component.css'
})
export class RegisllegadaComponent implements OnInit {
    
    // Inyección de servicios
    private router = inject(Router);
    private authService = inject(AuthService);
    private registrarLlegadaChoferService = inject(RegistrarLlegadaService); 

    // ⬅️ PROPIEDADES DE ESTADO Y VISTA
    ubicacionActual: string = 'Detectando ubicación...'; 
    fechaHoraActual: string = '';
    latitud: number = 0; 
    longitud: number = 0; 
    
    isSubmitting: boolean = true; // Iniciar en true para la carga inicial
    successMessage: string | null = null;
    errorMessage: string | null = null;

    // 🚀 PROPIEDADES NUEVAS PARA EL FLUJO DE ÉXITO
    isRegistered: boolean = false; 
    // ✅ AQUÍ SE USA EL NOMBRE DEL PERFIL O UN FALLBACK
    choferName: string = 'Chofer Desconocido'; 
    ubicacionRegistrada: string | null = null;
    fechaHoraRegistrada: string | null = null;

    // 🚀 PROPIEDADES CLAVE PARA EL FLUJO DE ASISTENCIA
    asistenciaEstado: AsistenciaEstado | null = null;
    private direccionTextoDetallada: string = 'Dirección no disponible';
    
    // ✅ URL de la API de Geocodificación Inversa
    private readonly ARCGIS_GEOCODE_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';


    ngOnInit(): void {
        // 🚀 OBTENER NOMBRE DEL CHOFER (username) DEL AUTH SERVICE
        const choferInfo = this.authService.getProfileName();
        if (choferInfo) {
            this.choferName = choferInfo;
        }

        this.checkAsistenciaStatus();
    }
        
    /**
     * 🚀 LÓGICA PRINCIPAL: Verifica si el chofer tiene asignaciones activas.
     */
    private checkAsistenciaStatus(): void {
        this.isSubmitting = true;
        this.errorMessage = null;

        const choferId = this.authService.getEntidadId(); 
        
        if (!choferId) {
            this.isSubmitting = false;
            this.errorMessage = 'Error de perfil: ID de Chofer no encontrado en el token.';
            return;
        }

        this.registrarLlegadaChoferService.obtenerEstadoAsistencia(choferId).pipe(
            switchMap(response => {
                this.asistenciaEstado = response.data;
                this.isSubmitting = false;
                
                // Si el estado es PRESENTE, muestra directamente la pantalla de éxito
                if (response.data.estadoDominante === 'PRESENTE') {
                    // Opcional: Cargar los detalles de la llegada anterior
                    this.ubicacionRegistrada = 'Almacén Central';
                    this.fechaHoraRegistrada = '25/05/2025 - 14:32 (Previamente Registrada)';
                    this.isRegistered = true;
                } else if (response.data.estadoDominante === 'ACTIVO') {
                    this.detectarDatosAutomaticos();
                } else {
                    this.ubicacionActual = 'N/A';
                    this.updateViewByStatus(response.data.estadoDominante);
                }
                return of(null);
            }),
            catchError(err => {
                this.isSubmitting = false;
                this.errorMessage = err.error?.message || 'Error de comunicación con el servidor.';
                this.asistenciaEstado = { 
                    estadoDominante: 'NO_ASIGNADO', 
                    idManifiestoVehiculoDisparador: null, 
                    idVehiculoAsignado: null 
                };
                this.ubicacionActual = 'N/A';
                return of(null);
            })
        ).subscribe();
    }
    
    /**
     * Actualiza los mensajes de la vista según el estado dominante.
     */
    private updateViewByStatus(estado: string): void {
        switch (estado) {
            case 'PRESENTE':
                this.successMessage = `✅ ¡Ya se registró la llegada para este vehículo!`;
                break;
            case 'NO_INICIADO':
                this.errorMessage = '⚠️ Su asistencia está registrada, pero aún no ha sido habilitada por el administrador.';
                break;
            case 'FALTO':
                this.errorMessage = '❌ Fue marcado como Faltante (FALTO) para este turno.';
                break;
            case 'NO_ASIGNADO':
                this.successMessage = 'No tiene asignaciones de registro de llegada activas en el sistema.';
                break;
            case 'ACTIVO':
                // Se actualizará con el resultado de la geolocalización
                break;
            default:
                this.errorMessage = 'Estado de asistencia desconocido o pendiente de asignación.';
        }
    }
    
    /**
     * Llama a la API de ArcGIS para convertir Lat/Lon a una dirección de texto.
     */
    private async fetchGeocodeAddress(lat: number, lon: number): Promise<any | null> {
        const url = `${this.ARCGIS_GEOCODE_URL}?location=${lon},${lat}&f=json`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error HTTP al llamar a ArcGIS:', response.statusText);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Fallo de red o CORS al obtener geocodificación:', error);
            return null; 
        }
    }


    /**
     * Obtiene la hora actual y detecta la ubicación del chofer.
     */
    async detectarDatosAutomaticos(): Promise<void> {
        this.ubicacionActual = 'Buscando su ubicación GPS...';
        this.isSubmitting = true; 
        this.errorMessage = null;

        // 1. Obtener Fecha y Hora actual
        const now = new Date();
        this.fechaHoraActual = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

        // 2. Obtener Ubicación real con Geolocation API
        const positionPromise = new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        });

        try {
            const position = await positionPromise;
            this.latitud = position.coords.latitude;
            this.longitud = position.coords.longitude;
            
            this.ubicacionActual = 'Coordenadas capturadas. Consultando dirección...';
            
            // 3. LLAMADA REAL A LA API EXTERNA DE GEOCODIFICACIÓN (ArcGIS)
            const addressData = await this.fetchGeocodeAddress(this.latitud, this.longitud);

            this.isSubmitting = false;
            
            if (addressData && addressData.address) {
                const address = addressData.address;
                
                // Texto detallado para el backend (LongLabel es el más completo)
                this.direccionTextoDetallada = address.LongLabel || `Dir. no detallada. Coords: ${this.latitud.toFixed(6)}, ${this.longitud.toFixed(6)}`;
                
                // Texto para el input (Match_addr es la dirección limpia)
                this.ubicacionActual = address.Match_addr;
                
                this.successMessage = 'Ubicación lista para registrar llegada.';
            } else {
                // FALLBACK: Usamos el fallback de coordenadas + texto simulado
                const latText = this.latitud.toFixed(6);
                const lonText = this.longitud.toFixed(6);
                
                this.direccionTextoDetallada = 
                    `FALLO API: Dirección No Obtenida. Coords GPS: (${latText}, ${lonText})`;
                
                this.ubicacionActual = `Coordenadas capturadas: ${latText}, ${lonText}`;
                this.errorMessage = 'La API de geocodificación falló. Enviando solo coordenadas GPS reales.';
            }

        } catch (error) {
            this.isSubmitting = false;
            console.error('Error en detección GPS o timeout:', error);
            this.ubicacionActual = 'Error al obtener ubicación. Por favor, intente de nuevo.';
            this.errorMessage = 'No pudimos obtener su ubicación. Revise permisos y conexión.';
            this.latitud = 0;
            this.longitud = 0;
        }
    }

    /**
     * Envía los datos de llegada al backend.
     */
    registrarLlegada(): void {
        this.successMessage = null;
        this.errorMessage = null;

        const choferId = this.authService.getEntidadId(); 
            
        if (this.asistenciaEstado?.estadoDominante !== 'ACTIVO' || !this.asistenciaEstado?.idManifiestoVehiculoDisparador) {
            this.errorMessage = 'No se puede registrar. La asistencia no está en estado ACTIVO o no se pudo obtener el ID del disparador.';
            return;
        }

        if (this.latitud === 0 || this.longitud === 0 || this.ubicacionActual.startsWith('Error') || choferId === null) {
            this.errorMessage = 'No se puede registrar la llegada. Faltan datos de ubicación o el perfil del chofer.';
            return;
        }

        this.isSubmitting = true;

        const requestData: RegistroLlegadaRequest = {
            idManifiestoVehiculo: this.asistenciaEstado.idManifiestoVehiculoDisparador, 
            idChofer: choferId,
            ubicacionTexto: this.direccionTextoDetallada,
            latitud: this.latitud,
            longitud: this.longitud,
            fotoEvidencia: null, // Asumimos null por ahora
            estadoLlegada: 'PRESENTE' // El backend fijará PRESENTE
        };
        
        // Llamada al servicio
        this.registrarLlegadaChoferService.registrarLlegada(requestData).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response.success) {
                    this.ubicacionRegistrada = this.ubicacionActual;
                    this.fechaHoraRegistrada = this.fechaHoraActual;
                    // 🚀 CLAVE: Mostrar la pantalla de éxito
                    this.isRegistered = true; 
                    this.successMessage = null; // Limpiar el mensaje de éxito del formulario
                } else {
                    this.errorMessage = response.message || 'Error desconocido al registrar.';
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Error HTTP al registrar llegada:', err);
                this.errorMessage = err.error?.message || 'Error de conexión con el servidor. Intente de nuevo.';
            }
        });
    }

    /**
     * Navega al dashboard del chofer (usado en los botones de la pantalla de éxito).
     */
    goToDashboard(): void {
        this.router.navigate(['/chofer-dashboard']); 
    }
}