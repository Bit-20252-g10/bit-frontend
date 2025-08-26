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

  it('should add authorization header when token exists', () => {
    const testToken = 'test-token-123';
    localStorage.setItem('authToken', testToken);

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
  });

  it('should not add authorization header when no token exists', () => {
    localStorage.removeItem('authToken');

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalsy();
  });

  it('should handle 401 errors by clearing storage', () => {
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

  it('should be created', () => {
    expect(httpClient).toBeTruthy();
  });
});
