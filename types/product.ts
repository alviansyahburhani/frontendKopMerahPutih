export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  sku?: string;
  isAvailable: boolean; // <--- Pastikan ini ada
  imageUrl?: string;
  categoryId: string;
  category?: {
    name: string;
    slug: string;
  };
}

// Update DTO untuk Create
export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  sku?: string;
  categoryId: string;
  isAvailable?: boolean; // <--- Tambahkan ini (Wajib sama dengan backend)
}

// Update DTO untuk Update
export interface UpdateProductData extends Partial<CreateProductData> {}