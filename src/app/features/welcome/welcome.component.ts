import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html', // ⬅️ Apunta al archivo HTML separado
  styleUrls: ['./welcome.component.css']   // ⬅️ Apunta al archivo CSS separado
})
export class WelcomeComponent implements OnInit {
  
  private authService = inject(AuthService);
  welcomeMessage: string = "Bienvenido Usuario";

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // 1. Obtener el rol del perfil
    const role = this.authService.getProfileRole();
    
    // 2. Obtener el nombre del perfil (opcional, para hacerlo más personal)
    // Si tienes getProfileName() implementado en AuthService, úsalo aquí.
    const name = this.authService.getProfileName(); 

    if (role) {
        // Formatea el rol (ej: CHOFER -> Chofer)
        const normalizedRol = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        
        // Si tenemos nombre, lo usamos, si no, usamos el rol
        if (name) {
             this.welcomeMessage = `Bienvenido, ${name}`;
        } else {
             this.welcomeMessage = `Bienvenido ${normalizedRol}`;
        }
    }
  }
}