import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; // ⬅️ Login SÍ necesita Router para navegar
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  usuario: string = '';
  contrasena: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  errorMsg: string | null = null;
  mostrarContenidoError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router // ⬅️ Inyectamos el Router aquí
  ) { }

  iniciarSesion(): void {
    // limpiar error antes de nuevo intento
    this.errorMsg = null;
    this.mostrarContenidoError = false;
    this.isLoading = true;

    // Simulamos un pequeño delay o llamamos al servicio real
    setTimeout(() => {
      this.authService.login(this.usuario, this.contrasena)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.data) {
              this.authService.guardarToken(res.data);
              
              // ⬅️ CORREGIDO: Redirigimos siempre a la selección de módulos/perfiles
              this.router.navigate(['/modules']); 
              
            } else {
              const msg = res.message || 'Error desconocido';
              this.showError(msg);
            }
          },
          error: (err) => {
            this.isLoading = false;
            const msg = err.error?.message || 'Error de conexión';
            this.showError(msg);
          }
        });
    }, 2000);
  }

  private showError(message: string): void {
    this.errorMsg = message;
    setTimeout(() => {
      this.mostrarContenidoError = true;
    }, 50);
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}