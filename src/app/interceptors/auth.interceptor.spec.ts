import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor])
        )
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add authorization header when token exists', () => {
    localStorage.setItem('authToken', 'test-token');
    
    httpClient.get('/test').subscribe();

    const httpRequest = httpMock.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    
    localStorage.removeItem('authToken');
  });

  it('should not add authorization header when token does not exist', () => {
    localStorage.removeItem('authToken');
    
    httpClient.get('/test').subscribe();

    const httpRequest = httpMock.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
  });
});
