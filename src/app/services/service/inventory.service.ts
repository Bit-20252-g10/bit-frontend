import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz genérica para cualquier ítem de inventario
export interface InventoryItem {
  _id: string;
  name: string;
  type: 'games' | 'consoles' | 'accessories';
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;

  // Campos opcionales específicos
  consola?: string;
  genero?: string;
  developer?: string;
  publisher?: string;
  rating?: string;
  multiplayer?: boolean;
  brand?: string;
  model?: string;
  features?: string;
  releaseYear?: number;
  color?: string;
  category?: string;

  createdAt: string;
  updatedAt: string;
}

// Respuesta estándar de la API
export interface ApiResponse<T> {
  allOK: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:4000/inventory'; 

  constructor(private http: HttpClient) {}

  /**
   * Obtener inventario completo o filtrado por tipo
   * @param type - 'games', 'consoles' o 'accessories'
   */
  getInventory(type?: 'games' | 'consoles' | 'accessories'): Observable<ApiResponse<InventoryItem[]>> {
    let url = this.apiUrl;
    if (type) {
      url += `?type=${type}`;
    }
    return this.http.get<ApiResponse<InventoryItem[]>>(url);
  }


   // Crear nuevo ítem

  createItem(item: Partial<InventoryItem>): Observable<ApiResponse<InventoryItem>> {
    return this.http.post<ApiResponse<InventoryItem>>(this.apiUrl, item);
  }

  
    // Actualizar ítem existente

  updateItem(id: string, data: Partial<InventoryItem>): Observable<ApiResponse<InventoryItem>> {
    return this.http.put<ApiResponse<InventoryItem>>(`${this.apiUrl}/${id}`, data);
  }

  
   // Eliminar ítem
   
  deleteItem(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
