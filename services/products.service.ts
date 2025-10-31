import { Product, CreateProductData, UpdateProductData } from "@/types/product";

// Resolve backend API base URL (prefer the shared axios base env key for consistency)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3002";

export interface PaginatedProducts {
  data: Product[];
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}



export const productsService = {
  // Get all products for admin (with filtering)
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    categorySlug?: string,
    isAvailable?: boolean
  ): Promise<PaginatedProducts> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (categorySlug) params.append("category", categorySlug);
    if (isAvailable !== undefined) params.append("available", isAvailable.toString());

    const response = await fetch(`${API_BASE_URL}/products/all?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Get available products (public endpoint)
  async getAvailableProducts(
    page: number = 1,
    limit: number = 10,
    categorySlug?: string
  ): Promise<PaginatedProducts> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (categorySlug) params.append("category", categorySlug);

    const response = await fetch(`${API_BASE_URL}/products?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch available products: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Get product by ID (for admin)
  async getProductById(id: string): Promise<Product> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/products/by-id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Get product by slug (public endpoint)
  async getProductBySlug(slug: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Create new product
  async createProduct(productData: CreateProductData): Promise<Product> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Update product
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }

    // For delete, the response is typically empty with 204 status
    return;
  },

  // Upload product image
  async uploadProductImage(id: string, file: File): Promise<Product> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/products/${id}/image`, {
      method: "POST",
      headers: {
        // Don't set Content-Type header for multipart/form-data, let browser set it with boundary
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },
};
