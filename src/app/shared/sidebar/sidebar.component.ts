import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. IMPORTANTE: Importamos RouterLinkActive para que funcione el estilo activo
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'; 
import { AuthService } from '../../core/services/auth.service'; 
import { filter, Subscription } from 'rxjs';

interface SidebarItem {
  icon: string;
  title: string;
  description?: string;
  route: string;
}

interface ModuleConfig {
  id: string;
  title: string;
  icon: string;
  baseRoute: string; // La ruta principal del módulo (para el botón Ayuda)
  subOptions: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  // 2. IMPORTANTE: Agregamos RouterLinkActive al array de imports
  imports: [CommonModule, RouterLink, RouterLinkActive], 
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  
  @Input() userName: string = 'Usuario';
  @Input() userRole: string = 'Rol';
  @Input() profileImageUrl: string = 'https://placehold.co/100x100/171C21/FFF?text=USR';

  private router = inject(Router);
  private authService = inject(AuthService);
  private routerSub!: Subscription;

  activeModule: ModuleConfig | null = null;

  // --- MENÚ PRINCIPAL ---
  mainMenuItems: SidebarItem[] = [
    { icon: 'fa-location-dot', title: 'Registrar Documentación', description: 'Registra el inicio de tu operación.', route: '/viewuser/registrarydocumentar' },
    { icon: 'fa-truck-fast', title: 'Rutas y Horarios', description: 'Ver dirección y pedidos.', route: '/viewuser/rutas' },
    { icon: 'fa-clipboard-list', title: 'Observaciones', description: 'Comunica incidencias.', route: '/viewuser/observaciones' },
    { icon: 'fa-file-signature', title: 'Firma y Marcaje', description: 'Cierre administrativo.', route: '/viewuser/firma' },
  ];

  // --- CONFIGURACIÓN DE MÓDULOS ---
  moduleConfigs: { [key: string]: ModuleConfig } = {
    'registrarydocumentar': {
      id: 'registrarydocumentar',
      title: 'Registrar Documentación',
      icon: 'fa-location-dot',
      baseRoute: '/viewuser/registrarydocumentar', 
      subOptions: [
        { title: 'Registrar Llegada', icon: 'fa-user', route: '/viewuser/registrarydocumentar/registrarllegada' },
        { title: 'Registrar Documentación', icon: 'fa-file', route: '/viewuser/registrarydocumentar/registrardocumentacion' }
      ]
    },
    'rutas': {
      id: 'rutas',
      title: 'Rutas y Horarios',
      icon: 'fa-truck-fast',
      baseRoute: '/viewuser/rutas',
      subOptions: [
        { title: 'Ver Mapa', icon: 'fa-map', route: '/viewuser/rutas/mapa' },
        { title: 'Lista de Pedidos', icon: 'fa-list', route: '/viewuser/rutas/lista' }
      ]
    }
  };

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectActiveModule();
    });
    this.detectActiveModule();
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  private detectActiveModule(): void {
    const url = this.router.url; 
    
    // Si estamos en la raíz o login, limpiamos
    if (url === '/viewuser' || url === '/viewuser/') {
      this.activeModule = null;
      return;
    }

    // Dividimos la URL: [0]="", [1]="viewuser", [2]="documentacion"
    const segments = url.split('/');
    const sectionKey = segments[2]; 

    if (sectionKey && this.moduleConfigs[sectionKey]) {
      this.activeModule = this.moduleConfigs[sectionKey];
    } else {
      this.activeModule = null;
    }
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleBack(): void {
    this.router.navigate(['/viewuser']);
  }

  // Lógica de Ayuda corregida
  handleHelp(): void {
    if (this.activeModule) {
      // Redirige al 'Home' del módulo actual (ej: /viewuser/documentacion)
      this.router.navigate([this.activeModule.baseRoute]);
    } else {
      // Si estamos en el menú principal, recarga el menú principal
      this.router.navigate(['/viewuser']);
    }
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}