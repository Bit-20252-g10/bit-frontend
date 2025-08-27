import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment.development';

export interface ProductModel {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  stock: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  allOK: boolean;
  message: string;
  data: T;
}

export interface UploadResponse {
  allOK: boolean;
  message: string;
  data: {
    imageUrl: string;
    filename: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl;
  private uploadUrl = `${environment.apiUrl}/image`;

  constructor(private http: HttpClient) {}


  getAllProducts(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(`${this.apiUrl}/products`);
  }

  getProductById(id: string): Observable<ApiResponse<ProductModel>> {
    return this.http.get<ApiResponse<ProductModel>>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Omit<ProductModel, '_id' | 'createdAt' | 'updatedAt'>): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<ProductModel>): Observable<ApiResponse<ProductModel>> {
    return this.http.put<ApiResponse<ProductModel>>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/products/${id}`);
  }

  getConsoles(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(`${this.apiUrl}/products?category=console`);
  }

  getAccessories(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(`${this.apiUrl}/products?category=accessory`);
  }

  createConsole(console: Partial<ProductModel>): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(`${this.apiUrl}/products`, console);
  }

  createAccessory(accessory: Partial<ProductModel>): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(`${this.apiUrl}/products`, accessory);
  }

  deleteConsole(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/products/${id}`);
  }

  deleteAccessory(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/products/${id}`);
  }


  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<UploadResponse>(`${this.uploadUrl}`, formData);
  }

  uploadProductImage(file: File, productId: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('productId', productId);
    return this.http.post<UploadResponse>(`${this.uploadUrl}/product`, formData);
  }
}
