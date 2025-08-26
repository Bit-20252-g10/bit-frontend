import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService, LoginResponse, User } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let toastrMock: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
  });

  it('should call login service with correct parameters on submit', () => {
    const mockResponse: LoginResponse = {
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', name: 'Test User' }
    };
    
    authServiceMock.login.and.returnValue(of(mockResponse));
    
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    
    expect(authServiceMock.login).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('should handle login error', fakeAsync(() => {
    const errorResponse = { 
      status: 401, 
      statusText: 'Unauthorized',
      error: { message: 'Unauthorized' }
    };
    authServiceMock.login.and.returnValue(throwError(() => errorResponse));
    
    component.loginForm.setValue({ email: 'test@test.com', password: 'wrong' });
    component.onSubmit();
    
    tick(); // Avanzar el tiempo para que se procese el error
    
    expect(component.errorMessage).toBe('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
    expect(toastrMock.error).toHaveBeenCalledWith('Credenciales incorrectas', 'Error de autenticación');
  }));

  it('should navigate to panel on successful login', () => {
    const mockResponse: LoginResponse = {
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', name: 'Test User' }
    };
    
    authServiceMock.login.and.returnValue(of(mockResponse));
    
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/panel']);
    expect(toastrMock.success).toHaveBeenCalledWith('Inicio de sesión exitoso', '¡Bienvenido!');
  });

  it('should not submit invalid form', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: '123' });
    component.onSubmit();
    
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should mark form as touched when submitting invalid form', () => {
    component.loginForm.setValue({ email: '', password: '' });
    
    component.onSubmit();
    
    expect(component.loginForm.touched).toBe(true);
  });
});
