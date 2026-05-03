import ApiClient from './ApiClient';

export interface CatalogProduct {
  id: string;
  establishmentId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  price?: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  mainImageUrl?: string | null;
  imageUrl?: string | null;
  establishment?: {
    id: string;
    name: string;
  };
}

export interface SaveProductPayload {
  name: string;
  description?: string;
  category?: string;
  price?: number;
}

export interface UploadedProductMedia {
  id: string;
  publicUrl: string;
  mimeType: string;
  size: number;
}

class CatalogService {
  constructor(private readonly apiClient: ApiClient) {}

  async getEstablishmentProducts(establishmentId: string): Promise<CatalogProduct[]> {
    return this.apiClient.get(`/establishments/${establishmentId}/products`);
  }

  async getProduct(productId: string): Promise<CatalogProduct> {
    return this.apiClient.get(`/products/${productId}`);
  }

  async createProduct(
    establishmentId: string,
    payload: SaveProductPayload,
  ): Promise<CatalogProduct> {
    return this.apiClient.post(`/establishments/${establishmentId}/products`, payload);
  }

  async updateProduct(
    establishmentId: string,
    productId: string,
    payload: SaveProductPayload,
  ): Promise<CatalogProduct> {
    return this.apiClient.put(`/establishments/${establishmentId}/products/${productId}`, payload);
  }

  async archiveProduct(
    establishmentId: string,
    productId: string,
  ): Promise<{ message: string }> {
    return this.apiClient.delete(`/establishments/${establishmentId}/products/${productId}`);
  }

  async uploadProductMedia(
    establishmentId: string,
    productId: string,
    uri: string,
    filename: string,
    mimeType: string = 'image/jpeg',
    onProgress?: (progress: number) => void,
  ): Promise<UploadedProductMedia> {
    return this.apiClient.uploadFile(
      `/establishments/${establishmentId}/products/${productId}/media?setAsMain=true`,
      {
        uri,
        name: filename,
        type: mimeType,
      },
      onProgress,
    );
  }
}

export default CatalogService;
