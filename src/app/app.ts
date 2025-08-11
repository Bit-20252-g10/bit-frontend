import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/shared/header/header';
import { Footer } from './components/shared/footer/footer';
import { CartComponent } from './components/shared/cart/cart';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    HeaderComponent, 
    Footer, 
    CartComponent, 
    RouterOutlet, 
    FormsModule 
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Princegaming';

  constructor(private auth: AuthService) {
    this.auth.validateToken().pipe(
      catchError(() => {
        this.auth.logout();
        return of(false);
      })
    ).subscribe(isValid => {
      if (!isValid) {
        this.auth.logout();
      }
    });
  }
}