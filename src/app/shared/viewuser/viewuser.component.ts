import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router'; // ⬅️ Importamos RouterOutlet
import { SidebarComponent } from '../sidebar/sidebar.component'; 
import { AuthService } from '../../core/services/auth.service';
import { ModulesDataService } from '../../core/services/modules.service'; 
import { HttpErrorResponse } from '@angular/common/http';

// Interfaces (para el tipado de los datos del backend)
interface ModuleUserDTO {
    usuarioId: number; 
    choferId: number | null;
    administradorId: number | null;
    nombre: string;
    rol: string;
    route: string;
    imagenUrl: string | null;
}
interface UserView {
    id: number;
    usuarioId: number; 
    name: string;
    role: string;
    avatarUrl: string;
    route: string;
    isChofer: boolean;
    isAdmin: boolean;
}

@Component({
  selector: 'app-view-user',
  standalone: true,
  // ⬅️ Agregamos RouterOutlet a los imports para que funcione en el HTML
  imports: [CommonModule, RouterOutlet, SidebarComponent], 
  templateUrl: './viewuser.component.html', 
  styleUrls: ['./viewuser.component.css']
})
export class ViewUserComponent implements OnInit {
  
  private authService = inject(AuthService);
  private router = inject(Router); 
  private modulesDataService = inject(ModulesDataService); 
  
  // Datos para el Sidebar
  profileName: string = 'Usuario';
  profileRole: string = 'Cargando...';
  profileImageUrl: string = 'https://placehold.co/100x100/171C21/FFF?text=USR';
  
  // Nota: Ya no necesitamos 'welcomeMessage' aquí, eso lo maneja WelcomeComponent.

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    const role = this.authService.getProfileRole(); 
    const profileId = this.authService.getProfileId();
    
    if (this.authService.isAuthenticated()) {
        if (role && profileId) {
            this.applyContextFromStorage(role);
        }
        this.fetchAndSetLatestProfileData();
    } else {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
  }

  private applyContextFromStorage(role: string): void {
      const imageUrl = this.authService.getProfileImageUrl();
      const name = this.authService.getProfileName(); 
      const tokenPayload = this.authService.decodeTokenPayload(); 
      
      this.profileRole = this.mapRoleToDisplayName(role); 
      this.profileName = name || tokenPayload?.username || 'Usuario'; 
      this.profileImageUrl = imageUrl || this.determineProfileAvatar(role);
      
      // Ya no configuramos welcomeMessage aquí
      console.log(`Contexto cargado: ${this.profileName} (${this.profileRole})`);
  }

  private fetchAndSetLatestProfileData(): void {
      const tokenPayload = this.authService.decodeTokenPayload();
      const currentUserId = tokenPayload?.usuarioId;

      if (!currentUserId) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
      }
      
      this.modulesDataService.getAvailableModules().subscribe({
          next: (data: ModuleUserDTO[]) => {
              if (data && data.length > 0) {
                  const primaryProfileDto = data.find(dto => dto.usuarioId === currentUserId);
                  
                  if (primaryProfileDto) {
                      const primaryProfile = this.mapDtoToUserView(primaryProfileDto);
                      
                      this.authService.setProfileContext(
                          primaryProfile.id, 
                          primaryProfile.role, 
                          primaryProfile.avatarUrl, 
                          primaryProfile.name
                      );

                      this.applyContextFromStorage(primaryProfile.role);
                  } else {
                      this.authService.logout();
                      this.router.navigate(['/login']);
                  }
              } else {
                  this.authService.logout();
                  this.router.navigate(['/login']);
              }
          },
          error: (err: HttpErrorResponse) => {
              if (err.status === 0) {
                  console.warn('Error de red. Usando datos locales.');
              } else if (err.status !== 401) {
                  console.error(`Error del servidor (${err.status}).`);
              }
          }
      });
  }

  private mapDtoToUserView(dto: ModuleUserDTO): UserView {
        const isChofer = dto.rol === 'CHOFER';
        const isAdmin = dto.rol === 'ADMINISTRADOR';

        let profileId = dto.usuarioId;
        if (isChofer && dto.choferId) {
             profileId = dto.choferId;
        } else if (isAdmin && dto.administradorId) {
             profileId = dto.administradorId;
        }

        let avatarUrl = dto.imagenUrl;
        if (!avatarUrl) {
             if (isAdmin) {
                 avatarUrl = 'https://placehold.co/100x100/4c3fef/ffffff?text=ADM';
             } else if (isChofer) {
                 avatarUrl = 'https://placehold.co/100x100/171C21/FFF?text=RM';
             } else {
                 avatarUrl = 'https://placehold.co/100x100/a0a0a0/ffffff?text=USR';
             }
        }
        
        const roleDisplayName = dto.rol.charAt(0).toUpperCase() + dto.rol.slice(1).toLowerCase();

        return {
            id: profileId,
            usuarioId: dto.usuarioId, 
            name: dto.nombre, 
            role: roleDisplayName, 
            avatarUrl: avatarUrl, 
            route: dto.route,
            isChofer: isChofer,
            isAdmin: isAdmin
        };
  }

  private mapRoleToDisplayName(rol: string): string {
    if (!rol) return 'Usuario';
    const normalizedRol = rol.toLowerCase();
    return normalizedRol.charAt(0).toUpperCase() + normalizedRol.slice(1);
  }
  
  private determineProfileAvatar(rol: string): string {
    if (!rol) return 'https://placehold.co/100x100/a0a0a0/ffffff?text=USR';
    const normalizedRol = rol.toUpperCase();
    
    if (normalizedRol === 'ADMINISTRADOR') {
      return 'https://placehold.co/100x100/4c3fef/ffffff?text=ADM';
    } else if (normalizedRol === 'CHOFER') {
      return 'https://placehold.co/100x100/171C21/FFF?text=RM'; 
    } else {
      return 'https://placehold.co/100x100/a0a0a0/ffffff?text=USR';
    }
  }
}