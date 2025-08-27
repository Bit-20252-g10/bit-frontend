import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {

    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/panel']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          this.toastr.success('Inicio de sesión exitoso', '¡Bienvenido!');
          this.router.navigate(['/panel']);
        },
        error: (error) => {
          console.error('Login error:', error);
          console.log('Error type:', typeof error);
          console.log('Error properties:', Object.keys(error));
          console.log('Error status:', error.status);
          console.log('Error status from any:', (error as any).status);
          
          this.isLoading = false;
          
          // Handle both HttpErrorResponse and simple error objects
          const status = error.status || (error as any).status;
          console.log('Final status:', status);
          
          if (status === 401) {
            this.errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
            this.toastr.error('Credenciales incorrectas', 'Error de autenticación');
          } else if (status === 404) {
            this.errorMessage = 'Usuario no encontrado.';
            this.toastr.error('Usuario no encontrado', 'Error');
          } else if (status === 0) {
            this.errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';
            this.toastr.error('Error de conexión', 'No se puede conectar al servidor');
          } else if (status === 500) {
            this.errorMessage = 'Error interno del servidor. Por favor, contacta al administrador.';
            this.toastr.error('Error del servidor', 'Error interno');
          } else {
            this.errorMessage = 'Error en el servidor. Por favor, intenta más tarde.';
            this.toastr.error('Error del servidor', 'Error');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName === 'email' ? 'El email' : 'La contraseña'} es requerido.`;
    }
    if (field?.hasError('email')) {
      return 'Por favor, ingresa un email válido.';
    }
    if (field?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
