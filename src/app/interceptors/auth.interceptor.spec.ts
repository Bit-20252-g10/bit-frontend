import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('debería agregar un encabezado de autorización cuando exista el token', () => {
    const testToken = 'test-token-123';
    localStorage.setItem('authToken', testToken);

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
  });

  it('no debería agregar un encabezado de autorización cuando no exista el token', () => {
    localStorage.removeItem('authToken');

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
  });

  it('debería manejar errores 401 limpiando el almacenamiento', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userData', '{"name":"test"}');

    httpClient.get('/api/unauthorized').subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpTestingController.expectOne('/api/unauthorized');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('userData')).toBeNull();
  });

  it('Deberia crear', () => {
    expect(httpClient).toBeTruthy();
  });
});
