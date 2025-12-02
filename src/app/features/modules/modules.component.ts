import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Se quitó RouterLink de aquí
import { ModulesDataService } from '../../core/services/modules.service';
import { AuthService } from '../../core/services/auth.service'; // Necesario para cerrar sesión

// --------------------------------------------------------------------------------
// INTERFAZ DEL DTO RECIBIDO DEL BACKEND (debe coincidir con ModuleUserDTO)
// --------------------------------------------------------------------------------
interface ModuleUserDTO {
    usuarioId: number; // ⬅️ ID del Usuario del Token
    choferId: number | null;
    administradorId: number | null;
    nombre: string;
    rol: string;
    route: string;
    imagenUrl: string | null;
}

// --------------------------------------------------------------------------------
// INTERFAZ DE VISTA (para simplificar el template)
// --------------------------------------------------------------------------------
interface UserView {
    id: number;
    // ⬅️ CLAVE: Añadir usuarioId para comparación
    usuarioId: number; 
    name: string; // ⬅️ Nombre legible
    role: string;
    avatarUrl: string; // ⬅️ Propiedad de imagen necesaria para setProfileContext
    route: string;
    isChofer: boolean;
    isAdmin: boolean;
}

@Component({
    selector: 'app-modules',
    standalone: true, 
    // ¡CORREGIDO! RouterLink ya no es necesario aquí.
    imports: [CommonModule], 
    templateUrl: './modules.component.html', // ⬅️ Ahora apunta al archivo HTML
    styleUrls: ['./modules.component.css']   // ⬅️ Ahora apunta al archivo CSS
})
export class ModulesComponent implements OnInit {
    
    // Inyección de dependencias usando 'inject'
    private router = inject(Router);
    private modulesDataService = inject(ModulesDataService);
    private authService = inject(AuthService);

    // Lista de usuarios disponibles (usando la interfaz de vista)
    users: UserView[] = [];
    loading: boolean = true;
    ingresoError: string | null = null; 
    
    // ID del usuario autenticado actualmente (del token)
    currentUserId: number | null = null;

    ngOnInit(): void {
        // Obtener el ID del usuario actual. (Asumo que está implementado en AuthService)
        this.currentUserId = this.authService.getCurrentUserId(); 
        this.loadModules();
    }

    /**
     * Carga los perfiles disponibles desde el backend.
     */
    loadModules(): void {
        this.loading = true;
        this.modulesDataService.getAvailableModules().subscribe({
            next: (data: ModuleUserDTO[]) => {
                this.users = data.map(dto => this.mapDtoToUserView(dto));
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar módulos:', err);
                // Si hay un error 401, redirigir al login
                if (err.status === 401) {
                    this.cerrarSesion();
                }
                this.loading = false;
                this.users = []; 
            }
        });
    }

    /**
     * Mapea el DTO del backend a la interfaz de vista del componente.
     */
    private mapDtoToUserView(dto: ModuleUserDTO): UserView {
        const isChofer = dto.rol === 'CHOFER';
        const isAdmin = dto.rol === 'ADMINISTRADOR';

        // 1. Determinar el ID del perfil principal
        let profileId = dto.usuarioId;
        if (isChofer && dto.choferId) {
             profileId = dto.choferId;
        } else if (isAdmin && dto.administradorId) {
             profileId = dto.administradorId;
        }

        // 2. Determinar Avatar (Placeholder si imagenUrl es null)
        let avatarUrl = dto.imagenUrl;
        if (!avatarUrl) {
             if (isAdmin) {
                 avatarUrl = 'https://placehold.co/70x70/4c3fef/ffffff?text=ADM';
             } else if (isChofer) {
                 avatarUrl = 'https://placehold.co/70x70/ef833f/ffffff?text=CHO';
             } else {
                 avatarUrl = 'https://placehold.co/70x70/a0a0a0/ffffff?text=USR';
             }
        }
        
        // 3. Determinar Nombre de Rol para Display (Se usa el rol del backend)
        const roleDisplayName = dto.rol.charAt(0).toUpperCase() + dto.rol.slice(1).toLowerCase();


        return {
            id: profileId,
            usuarioId: dto.usuarioId, // ⬅️ CLAVE: Propiedad para comparación
            name: dto.nombre, // ⬅️ Nombre legible del backend
            role: roleDisplayName, 
            avatarUrl: avatarUrl, 
            route: dto.route,
            isChofer: isChofer,
            isAdmin: isAdmin
        };
    }
    
    /**
     * Navega a la ruta del módulo seleccionado después de una validación.
     * @param user El perfil seleccionado (UserView)
     */
    ingresarComoUsuario(user: UserView): void { 
        this.ingresoError = null; 
        
        // ⬅️ VALIDACIÓN DE SEGURIDAD: Solo permite ingresar si el perfil pertenece al usuario logueado.
        if (this.currentUserId !== user.usuarioId) {
             this.ingresoError = `Error de seguridad: No puede ingresar a un perfil que no es el suyo.`;
             console.error('Intento de ingresar a perfil ajeno.');
             return;
        }

        // 1. Guardar el contexto del perfil seleccionado
        // ⬅️ CLAVE: Pasando el nombre completo (user.name) para que se muestre en el Sidebar
        this.authService.setProfileContext(user.id, user.role, user.avatarUrl, user.name); 

        // 2. Redirigir al dashboard principal (donde está ViewUserComponent)
        this.router.navigate(['/viewuser']);
        console.log(`Navegando a dashboard principal: /viewuser. Perfil seleccionado ID: ${user.id}`);
    }

    /**
     * Lógica para cerrar la sesión actual.
     */
    cerrarSesion(): void {
        this.authService.logout(); // Limpia el token
        this.router.navigate(['/login']); 
        console.log('Cerrando sesión...');
    }
}