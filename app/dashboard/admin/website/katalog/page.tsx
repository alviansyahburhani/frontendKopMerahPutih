// Lokasi: frontend/app/dashboard/admin/website/katalog/page.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit, Trash2, X, Tag, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { productsService } from "@/services/products.service";
import { Product, ProductCategory, CreateProductData, UpdateProductData } from "@/types/product";
import ProductFormModal from "@/components/ProductFormModal";

export default function ManajemenKatalogPage() {
  const [filters, setFilters] = useState({
    search: '',
    kategori: '',
    status: '',
  });
  const [produkList, setProdukList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (showGlobalLoading: boolean = true) => {
      try {
        if (showGlobalLoading) {
          setLoading(true);
        }

        let statusFilter: boolean | undefined = undefined;
        if (filters.status === "Tersedia") statusFilter = true;
        else if (filters.status === "Habis") statusFilter = false;

        const response = await productsService.getAllProducts(
          1,
          100,
          filters.kategori || undefined,
          statusFilter
        );
        setProdukList(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Gagal memuat data produk. Silakan coba lagi nanti.");
        setProdukList([]);
      } finally {
        if (showGlobalLoading) {
          setLoading(false);
        }
      }
    },
    [filters.kategori, filters.status]
  );

  // Fetch products from the backend
  useEffect(() => {
    fetchProducts().catch(console.error);
  }, [fetchProducts]);

  // Fetch product categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // For now, we don't have a direct API for categories, 
        // so we'll extract unique categories from products
        // In a real scenario, you'd have a specific endpoint for categories
        const categoriesMap: Record<string, ProductCategory> = {};
        
        produkList.forEach(product => {
          if (!categoriesMap[product.categoryId]) {
            categoriesMap[product.categoryId] = {
              id: product.categoryId,
              name: product.category.name,
              slug: product.category.slug,
              createdAt: product.category.createdAt,
              updatedAt: product.category.updatedAt
            };
          }
        });
        
        setCategories(Object.values(categoriesMap));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [produkList]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', kategori: '', status: '' });
  };

  const filteredProduk = useMemo(() => {
    return produkList.filter(produk => {
      return (
        produk.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.kategori === '' || produk.category.slug === filters.kategori.toLowerCase())
      );
    });
  }, [produkList, filters]);

  const handleTambahProduk = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduk = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduk = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    try {
      await productsService.deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setError('Gagal menghapus produk. Silakan coba lagi.');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    const newAvailability = !product.isAvailable;
    setActionLoadingId(product.id);

    try {
      await productsService.updateProduct(product.id, { isAvailable: newAvailability });
      await fetchProducts(false);
    } catch (error) {
      console.error("Error updating product availability:", error);
      setError("Gagal memperbarui status produk. Silakan coba lagi.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmitProduct = async (productData: CreateProductData | UpdateProductData, imageFile: File | null) => {
    try {
      let createdOrUpdatedProduct: Product;
      
      if (selectedProduct) {
        // Update existing product
        createdOrUpdatedProduct = await productsService.updateProduct(selectedProduct.id, productData as UpdateProductData);
      } else {
        // Create new product
        createdOrUpdatedProduct = await productsService.createProduct(productData as CreateProductData);
      }
      
      // If there's an image file, upload it
      if (imageFile) {
        await productsService.uploadProductImage(createdOrUpdatedProduct.id, imageFile);
      }
      
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Map the backend product status to the expected frontend format
  const getStatusFromAvailability = (isAvailable: boolean) => {
    return isAvailable ? 'Tersedia' : 'Habis';
  };

  // Map the backend category name to the expected frontend format
  const getKategoriFromCategory = (categoryName: string) => {
    const categoryMap: Record<string, string> = {
      'Sembako': 'Sembako',
      'Elektronik': 'Elektronik',
      'Jasa': 'Jasa',
      'Lainnya': 'Lainnya',
    };

    // Look for exact match first, otherwise use the category name as is (in sentence case)
    const exactMatch = categoryMap[categoryName];
    if (exactMatch) return exactMatch;
    
    // Convert to sentence case if not found in map
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
  };

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const KatalogSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <div className="h-4 w-96 mt-2" />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-6" />

          {/* Filter Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-8">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
             <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/2 mt-2" />
                </div>
                <div className="flex justify-end gap-2 border-t p-3 bg-gray-50">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <KatalogSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Katalog Produk"
        description="Kelola produk dan jasa yang ditampilkan di landing page."
        actionButton={
            <Button onClick={handleTambahProduk} variant="primary">
                <PlusCircle size={20} /><span>Tambah Produk</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Daftar Produk & Jasa</h2>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Nama Produk</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Nama produk..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="kategori" className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
              <select id="kategori" name="kategori" value={filters.kategori} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="sembako">Sembako</option>
                <option value="elektronik">Elektronik</option>
                <option value="jasa">Jasa</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
             <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Habis">Habis</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          {/* --- Tampilan Kartu Produk --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProduk.map((produk) => (
              <div key={produk.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow">
                <div className="relative w-full h-40">
                  {produk.imageUrl ? (
                    <Image 
                      src={produk.imageUrl} 
                      alt={produk.name} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                      unoptimized // Add this attribute to bypass Next.js Image optimization for external images
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                  )}
                   <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusFromAvailability(produk.isAvailable) === 'Tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                   }`}>
                      {getStatusFromAvailability(produk.isAvailable)}
                   </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Tag size={12}/> {getKategoriFromCategory(produk.category.name)}</p>
                  <h3 className="font-bold text-gray-800 mt-1 truncate">{produk.name}</h3>
                  <p className="text-lg font-extrabold text-brand-red-600 mt-2">
                    {getKategoriFromCategory(produk.category.name) === 'Jasa' ? `Biaya Admin: Rp${produk.price.toLocaleString('id-ID')}` : `Rp${produk.price.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className="flex justify-end gap-2 border-t p-3 bg-gray-50">
                    <Button 
                      variant="outline" 
                      className="text-xs p-2" 
                      onClick={() => handleEditProduk(produk)}
                    >
                      <Edit size={16}/>
                    </Button>
                    <Button
                      variant="outline"
                      className={clsx(
                        "text-xs p-2",
                        !produk.isAvailable && "border-amber-200 text-amber-600 hover:bg-amber-50",
                        actionLoadingId === produk.id && "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => handleToggleAvailability(produk)}
                      disabled={actionLoadingId === produk.id}
                      title={produk.isAvailable ? "Sembunyikan di katalog publik" : "Tampilkan di katalog publik"}
                      aria-label={produk.isAvailable ? "Sembunyikan di katalog publik" : "Tampilkan di katalog publik"}
                    >
                      {produk.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteProduk(produk.id)}
                    >
                      <Trash2 size={16}/>
                    </Button>
                </div>
              </div>
            ))}
            {filteredProduk.length === 0 && (
              <div className="col-span-full text-center p-10 text-gray-500">
                  Tidak ada produk yang sesuai dengan filter.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitProduct}
        product={selectedProduct}
        categories={categories}
      />
    </div>
  );
}
