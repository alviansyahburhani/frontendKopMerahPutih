// types/product.ts

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  unit?: string;
  sku?: string;
  imageUrl?: string;
  isAvailable: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: ProductCategory;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  sku?: string;
  isAvailable?: boolean;
  categoryId: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  sku?: string;
  isAvailable?: boolean;
  categoryId?: string;
}