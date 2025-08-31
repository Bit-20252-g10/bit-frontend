import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GamesService, Game } from '../../../services/games.service';
import { UploadService } from '../../../services/upload.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  ProductService,
  ProductModel,
} from '../../../services/product.service';
import {
  InventoryService,
  InventoryItem,
} from '../../../services/service/inventory.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  games: Game[] = [];
  isLoading = true;
  error: string | null = null;
  editIndex: number | null = null;
  editedGame: Partial<Game> = {};
  showAddForm = false;
  newGame: Partial<Game> = {
    name: '',
    consola: '',
    genero: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    developer: '',
    publisher: '',
    rating: 'E',
    multiplayer: false,
    imageUrl: '',
  };
  selectedFile: File | null = null;

  isUploading = false;
  consoles: ProductModel[] = [];
  accessories: ProductModel[] = [];
  showAddConsoleForm = false;
  showAddAccessoryForm = false;
  newConsole: Partial<ProductModel> & {
    selectedFile?: File | null;
    brand?: string;
    model?: string;
    features?: string;
    releaseYear?: number;
    color?: string;
  } = {
    name: '',
    brand: '',
    model: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: '',
    selectedFile: null,
    features: '',
    releaseYear: undefined,
    color: '',
  };
  newAccessory: Partial<ProductModel> & {
    selectedFile?: File | null;
    brand?: string;
  } = {
    name: '',
    price: 0,
    category: '',
    stock: 0,
    description: '',
    imageUrl: '',
    selectedFile: null,
    brand: '',
  };

  editConsoleIndex: number | null = null;
  editedConsole: Partial<ProductModel> = {};
  editAccessoryIndex: number | null = null;
  editedAccessory: Partial<ProductModel> = {};
  successMessage: string | null = null;

  constructor(
    private gamesService: GamesService,
    private productService: ProductService,
    private uploadService: UploadService,
    private router: Router,
    private http: HttpClient,
    private inventoryService: InventoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadGames();
    this.loadConsoles();
    this.loadAccessories();
  }

  loadGames() {
    this.isLoading = true;
    this.gamesService.getAllGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          // Map the response data to match the Game interface expected by the dashboard
          this.games = response.data.map((item: any) => ({
            _id: item._id,
            name: item.name,
            consola: item.consola,
            genero: item.genero,
            descripcion: item.description,
            precio: item.price,
            stock: item.stock,
            developer: item.developer,
            publisher: item.publisher,
            releaseYear: item.releaseYear,
            rating: item.rating,
            multiplayer: item.multiplayer,
            imageUrl: item.imageUrl,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            isActive: item.isActive ?? true,
          }));
        } else {
          this.toastr.error(response.message, 'Error');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar los juegos.', 'Error');
        this.isLoading = false;
      },
    });
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editedGame = { ...this.games[index] };
  }

  cancelEdit() {
    this.editIndex = null;
    this.editedGame = {};
  }

  saveEdit() {
    const editIndex = this.editIndex;
    if (!this.editedGame.precio || !this.editedGame.stock || editIndex == null) {
      this.toastr.error('Datos de edición inválidos', 'Error');
      return;
    }

    if (editIndex < 0 || editIndex >= this.games.length) {
      this.toastr.error('Índice de juego inválido', 'Error');
      this.cancelEdit();
      return;
    }

    const game = this.games[editIndex];
    if (!game || !game._id) {
      this.toastr.error('Juego no encontrado', 'Error');
      this.cancelEdit();
      return;
    }

    this.inventoryService.updateItem(game._id, {
        price: this.editedGame.precio,
        stock: this.editedGame.stock,
      })
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            this.games[editIndex] = {
              ...this.games[editIndex],
              precio: this.editedGame.precio!,
              stock: this.editedGame.stock!,
              updatedAt: response.data.updatedAt
            };
            this.cancelEdit();
            this.toastr.success('Juego actualizado correctamente', 'Éxito');
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error('Error al guardar los cambios.', 'Error');
        },
      });
  }

  deleteGame(game: Game, index: number) {
    if (!confirm('¿Seguro que deseas eliminar este juego?')) return;
    this.gamesService.deleteGame(game._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games.splice(index, 1);
          // Mostrar alerta con componente Angular Toastr
          this.toastr.success('Juego eliminado correctamente', 'Éxito');
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Error al eliminar el juego.', 'Error');
      },
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
    this.toastr.info('Sesión cerrada', 'Info');
  }

  getPriceClass(precio: number): string {
    if (precio <= 50000) return 'price-low';
    if (precio <= 100000) return 'price-medium';
    return 'price-high';
  }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'stock-low';
    if (stock <= 15) return 'stock-medium';
    return 'stock-high';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'El archivo es demasiado grande. Máximo 5MB.';
        return;
      }
      this.selectedFile = file;
      this.error = null;
    }
  }

  uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No hay archivo seleccionado');
        return;
      }
      this.isUploading = true;
      console.log('Iniciando subida de imagen...');
      this.uploadService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            let imageUrl =
              response.data?.imageUrl ||
              response.data?.url ||
              response.data?.filename ||
              response.data?.path ||
              response.data;

            if (imageUrl && typeof imageUrl === 'string') {
              resolve(imageUrl);
            } else {
              reject('No se pudo obtener la URL de la imagen');
            }
          } else {
            reject(response.message || 'Error en la subida de imagen');
          }
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Error en subida de imagen:', err);
          reject('Error al subir la imagen');
        },
      });
    });
  }

  async addGame() {
    if (
      !this.newGame.name ||
      (this.newGame.precio === undefined || this.newGame.precio === null) ||
      this.newGame.stock == null
    ) {
      this.toastr.error('Faltan campos obligatorios: nombre, precio y stock', 'Error');
      return;
    }

    try {
      let imageUrl = '';
      if (this.selectedFile) {
        console.log('Subiendo imagen...');
        imageUrl = await this.uploadImage();
      }

      const productData: Partial<InventoryItem> = {
        name: this.newGame.name || '',
        type: 'games' as const,
        description: this.newGame.descripcion || '',
        price: this.newGame.precio || 0,
        stock: this.newGame.stock || 0,
        imageUrl:
          imageUrl ||
          'https://placehold.co/400x300/e9ecef/212529?text=Sin+Imagen',
        consola: this.newGame.consola || '',
        genero: this.newGame.genero || '',
        developer: this.newGame.developer || '',
        publisher: this.newGame.publisher || '',
        releaseYear: this.newGame.releaseYear || undefined,
        rating: this.newGame.rating || 'E',
        multiplayer: this.newGame.multiplayer || false,
      };

      console.log('Datos del producto a enviar:', productData);

      this.inventoryService.createItem(productData).subscribe({
        next: (response: any) => {
          if (response.allOK) {
            this.toastr.success('Producto agregado exitosamente', 'Éxito');
            this.loadGames(); // refrescar lista
            this.showAddForm = false;
            this.resetForm(); // limpiar formulario
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: (err: any) => {
          this.toastr.error('No se pudo agregar el producto', 'Error');
        },
      });
    } catch (error: any) {
      this.toastr.error(error.message || error, 'Error');
    }
  }

  resetForm() {
    this.newGame = {
      name: '',
      consola: '',
      genero: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      developer: '',
      publisher: '',
      rating: 'E',
      multiplayer: false,
      imageUrl: '',
    };
    this.selectedFile = null;
  }

  onGameImageSelected(event: any, game: Game): void {
    const file = event.target.files?.[0];
    if (file) {
      this.updateGameImage(game, file);
    }
  }

  async updateGameImage(game: Game, file: File): Promise<void> {
    try {
      this.uploadService.uploadGameImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            // Update the game with new image URL
            this.gamesService
              .updateGame(game._id, { imageUrl: response.data.imageUrl })
              .subscribe({
                next: (updateResponse) => {
                  if (updateResponse.allOK) {
                    const index = this.games.findIndex(
                      (g) => g._id === game._id
                    );
                    if (index !== -1) {
                      this.games[index] = {
                        ...this.games[index],
                        imageUrl: response.data.imageUrl,
                      };
                    }
                  }
                },
              });
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al actualizar la imagen del juego.';
        },
      });
    } catch (error) {
      this.error = error as string;
    }
  }

  loadConsoles() {
    this.isLoading = true;
    this.productService.getConsoles().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.consoles = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar las consolas.', 'Error');
        this.isLoading = false;
      },
    });
  }

  loadAccessories() {
    this.isLoading = true;
    this.productService.getAccessories().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.accessories = response.data;
        } else {
          this.toastr.error(response.message, 'Error');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar los accesorios.', 'Error');
        this.isLoading = false;
      },
    });
  }

  onConsoleImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newConsole.selectedFile = file;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.newConsole.imageUrl = response.data.imageUrl;
          }
        },
      });
    }
  }

  onAccessoryImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newAccessory.selectedFile = file;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.newAccessory.imageUrl = response.data.imageUrl;
          }
        },
      });
    }
  }

  async addConsole() {
    if (
      !this.newConsole.name ||
      !this.newConsole.price ||
      this.newConsole.stock == null
    ) {
      this.toastr.error('Faltan campos obligatorios: nombre, precio y stock', 'Error');
      return;
    }

    try {
      let imageUrl = '';
      if (this.newConsole.selectedFile) {
        imageUrl = await this.uploadConsoleImage();
      }

      const consoleData: any = {
        name: this.newConsole.name || '',
        price: this.newConsole.price || 0,
        stock: this.newConsole.stock || 0,
        description: this.newConsole.description || '',
        imageUrl: imageUrl || 'https://placehold.co/400x300/e9ecef/212529?text=Sin+Imagen',
        brand: this.newConsole.brand || '',
        model: this.newConsole.model || '',
        features: this.newConsole.features || '',
        releaseYear: this.newConsole.releaseYear,
        color: this.newConsole.color || '',
        category: 'console',
      };

      this.productService.createConsole(consoleData).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.toastr.success('Consola agregada exitosamente', 'Éxito');
            this.loadConsoles();
            this.showAddConsoleForm = false;
            this.resetConsoleForm();
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('No se pudo agregar la consola', 'Error');
        },
      });
    } catch (error: any) {
      this.toastr.error(error.message || error, 'Error');
    }
  }

  async addAccessory() {
    if (
      !this.newAccessory.name ||
      !this.newAccessory.price ||
      this.newAccessory.stock == null
    ) {
      this.toastr.error('Faltan campos obligatorios: nombre, precio y stock', 'Error');
      return;
    }

    try {
      let imageUrl = '';
      if (this.newAccessory.selectedFile) {
        imageUrl = await this.uploadAccessoryImage();
      }

      const accessoryData: any = {
        name: this.newAccessory.name || '',
        price: this.newAccessory.price || 0,
        stock: this.newAccessory.stock || 0,
        description: this.newAccessory.description || '',
        imageUrl: imageUrl || 'https://placehold.co/400x300/e9ecef/212529?text=Sin+Imagen',
        brand: this.newAccessory.brand || '',
        category: this.newAccessory.category || '',
      };

      this.productService.createAccessory(accessoryData).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.toastr.success('Accesorio agregado exitosamente', 'Éxito');
            this.loadAccessories();
            this.showAddAccessoryForm = false;
            this.resetAccessoryForm();
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('No se pudo agregar el accesorio', 'Error');
        },
      });
    } catch (error: any) {
      this.toastr.error(error.message || error, 'Error');
    }
  }

  resetConsoleForm() {
    this.newConsole = {
      name: '',
      brand: '',
      model: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: '',
      selectedFile: null,
      features: '',
      releaseYear: undefined,
      color: '',
    };
  }

  resetAccessoryForm() {
    this.newAccessory = {
      name: '',
      price: 0,
      category: '',
      stock: 0,
      description: '',
      imageUrl: '',
      selectedFile: null,
      brand: '',
    };
  }

  uploadConsoleImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.newConsole.selectedFile) {
        reject('No hay archivo seleccionado para la consola');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.newConsole.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            resolve(response.data.imageUrl);
          } else {
            reject(response.message);
          }
        },
        error: (err) => {
          this.isUploading = false;
          reject('Error al subir la imagen de la consola');
        },
      });
    });
  }

  uploadAccessoryImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.newAccessory.selectedFile) {
        reject('No hay archivo seleccionado para el accesorio');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.newAccessory.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            resolve(response.data.imageUrl);
          } else {
            reject(response.message);
          }
        },
        error: (err) => {
          this.isUploading = false;
          reject('Error al subir la imagen del accesorio');
        },
      });
    });
  }

  startEditConsole(index: number) {
    this.editConsoleIndex = index;
    this.editedConsole = { ...this.consoles[index] };
  }

  cancelEditConsole() {
    this.editConsoleIndex = null;
    this.editedConsole = {};
  }

  saveEditConsole(consoleItem: ProductModel) {
    if (!this.editedConsole.price || !this.editedConsole.stock) return;
    this.productService
      .updateProduct(consoleItem._id, {
        name: this.editedConsole.name,
        price: this.editedConsole.price,
        stock: this.editedConsole.stock,
        category: this.editedConsole.category,
        description: this.editedConsole.description,
      })
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            this.consoles[this.editConsoleIndex!] = {
              ...consoleItem,
              ...response.data,
            };
            this.cancelEditConsole();
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al guardar los cambios de la consola.';
        },
      });
  }

  deleteConsole(consoleItem: ProductModel, index: number) {
    if (!confirm(`¿Seguro que quieres eliminar "${consoleItem.name}"?`)) return;

    this.productService.deleteConsole(consoleItem._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.consoles.splice(index, 1);
          this.toastr.success('Consola eliminada correctamente', 'Éxito');
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: () => {
        this.toastr.error('Error al eliminar la consola.', 'Error');
      },
    });
  }

  startEditAccessory(index: number) {
    this.editAccessoryIndex = index;
    this.editedAccessory = { ...this.accessories[index] };
  }

  cancelEditAccessory() {
    this.editAccessoryIndex = null;
    this.editedAccessory = {};
  }

  saveEditAccessory(accessoryItem: ProductModel) {
    if (!this.editedAccessory.price || !this.editedAccessory.stock) {
      this.toastr.error('Precio y stock son obligatorios', 'Error');
      return;
    }
    this.productService
      .updateProduct(accessoryItem._id, {
        name: this.editedAccessory.name,
        price: this.editedAccessory.price,
        stock: this.editedAccessory.stock,
        category: this.editedAccessory.category,
        description: this.editedAccessory.description,
      })
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            this.accessories[this.editAccessoryIndex!] = {
              ...accessoryItem,
              ...response.data,
            };
            this.cancelEditAccessory();
            this.toastr.success('Accesorio actualizado correctamente', 'Éxito');
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error('Error al guardar los cambios del accesorio.', 'Error');
        },
      });
  }

  deleteAccessory(accessoryItem: ProductModel, index: number) {
    if (!confirm(`¿Seguro que quieres eliminar "${accessoryItem.name}"?`)) return;

    this.productService.deleteAccessory(accessoryItem._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.accessories.splice(index, 1);
          this.toastr.success('Accesorio eliminado correctamente', 'Éxito');
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: () => {
        this.toastr.error('Error al eliminar el accesorio.', 'Error');
      },
    });
  }

  // Variables para edición
  editProductIndex: number | null = null;
  editedProduct: Partial<InventoryItem> = {};

  startEditProduct(index: number, product: InventoryItem) {
    this.editProductIndex = index;
    this.editedProduct = { ...product };
  }

  cancelEditProduct() {
    this.editProductIndex = null;
    this.editedProduct = {};
  }

  saveEditProduct(product: InventoryItem, index: number) {
    if (
      this.editedProduct.price == null ||
      this.editedProduct.stock == null ||
      !this.editedProduct.name
    ) {
      this.error = 'Nombre, precio y stock son obligatorios';
      return;
    }

    this.inventoryService
      .updateItem(product._id, this.editedProduct)
      .subscribe({
        next: (response) => {
          if (response.allOK) {
            if (product.type === 'games') {
              this.games[index] = {
                ...this.games[index],
                ...this.editedProduct,
              } as Game;
            } else if (product.type === 'consoles') {
              this.consoles[index] = {
                ...this.consoles[index],
                ...this.editedProduct,
              } as ProductModel;
            } else if (product.type === 'accessories') {
              this.accessories[index] = {
                ...this.accessories[index],
                ...this.editedProduct,
              } as ProductModel;
            }

            this.successMessage = 'Producto actualizado correctamente';
            this.cancelEditProduct();
            setTimeout(() => (this.successMessage = null), 3000);
          } else {
            this.error = response.message;
          }
        },
        error: () => {
          this.error = 'Error al actualizar el producto.';
        },
      });
  }

  deleteProduct(product: InventoryItem, index: number) {
    if (!confirm(`¿Seguro que quieres eliminar "${product.name}"?`)) return;

    this.inventoryService.deleteItem(product._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          if (product.type === 'games') this.games.splice(index, 1);
          else if (product.type === 'consoles') this.consoles.splice(index, 1);
          else if (product.type === 'accessories')
            this.accessories.splice(index, 1);

          this.successMessage = 'Producto eliminado correctamente';
          setTimeout(() => (this.successMessage = null), 3000);
        } else {
          this.error = response.message;
        }
      },
      error: () => {
        this.error = 'Error al eliminar el producto.';
      },
    });
  }
}
