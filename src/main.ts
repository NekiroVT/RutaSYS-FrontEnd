import { bootstrapApplication } from '@angular/platform-browser';
// ⚠️ Ya no necesitamos importar 'provideRouter' ni 'routes' aquí
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Usamos solo el appConfig, que ya debe contener el router.
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));