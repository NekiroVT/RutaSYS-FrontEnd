import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ModulesComponent } from './features/modules/modules.component';
import { ViewUserComponent } from './shared/viewuser/viewuser.component'; 
import { authGuard } from './core/guard/auth.guard'; 

// Importamos los componentes principales del Dashboard
import { WelcomeComponent } from './features/welcome/welcome.component';

// Importamos los componentes de Documentación
import { HomeComponent } from './features/regisydocu/home/home.component';
import { RegisllegadaComponent } from './features/regisydocu/regisllegada/regisllegada.component';
import { RegisdocumentacionComponent } from './features/regisydocu/regisdocumentacion/regisdocumentacion.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // ⬅️ RUTAS PROTEGIDAS
  { 
    path: 'modules', 
    component: ModulesComponent,
    canActivate: [authGuard] 
  },
  
  // ⬅️ DASHBOARD PRINCIPAL
  { 
    path: 'viewuser', 
    component: ViewUserComponent, 
    canActivate: [authGuard],
    children: [
        // 1. RUTA POR DEFECTO ('/viewuser') -> Welcome
        { path: '', component: WelcomeComponent }, 
        
        // -----------------------------------------------------
        // 🚀 CORRECCIÓN AQUÍ: Rutas "Planas" (Sin children anidados)
        // -----------------------------------------------------

        // A. Pantalla principal de documentación ('/viewuser/documentacion')
        { path: 'registrarydocumentar', component: HomeComponent },
        
        // B. Formulario de Llegada ('/viewuser/documentacion/llegada')
        // Nota: Al ser hermana, reemplazará visualmente al HomeComponent
        { path: 'registrarydocumentar/registrarllegada', component: RegisllegadaComponent },
        
        // C. Formulario de Salida ('/viewuser/documentacion/salida')
        // Nota: Corregí el path para que coincida con tu comentario de 'salida'
        { path: 'registrarydocumentar/registrardocumentacion', component: RegisdocumentacionComponent }
    ]
  },
  
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];