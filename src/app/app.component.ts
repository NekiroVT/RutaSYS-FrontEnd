import { Component } from '@angular/core';
// Importa RouterOutlet (y RouterLink/RouterLinkActive si los usas)
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // ⬅️ ¡DEBE estar aquí!
  imports: [RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // ...
}