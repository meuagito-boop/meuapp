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

class CatalogService {
  constructor(private readonly apiClient: ApiClient) {}

  async getEstablishmentProducts(establishmentId: string): Promise<CatalogProduct[]> {
    return this.apiClient.get(`/establishments/${establishmentId}/products`);
  }

  async getProduct(productId: string): Promise<CatalogProduct> {
    return this.apiClient.get(`/products/${productId}`);
  }
}

export default CatalogService;
