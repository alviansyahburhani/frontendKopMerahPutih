import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import Button from './Button';
import { Product, ProductCategory, CreateProductData } from '@/types/product';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: CreateProductData, imageFile: File | null) => void;
  product?: Product | null;
  categories: ProductCategory[];
}

export default function ProductFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product,
  categories
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: undefined as number | undefined,  // Allow undefined for empty state
    unit: '',
    sku: '',
    isAvailable: true,
    categoryId: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-populate form when editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        unit: product.unit || '',
        sku: product.sku || '',
        isAvailable: product.isAvailable,
        categoryId: product.categoryId
      });
      setPreviewUrl(product.imageUrl || null);
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: undefined,  // Start with undefined instead of 0
        unit: '',
        sku: '',
        isAvailable: true,
        categoryId: categories.length > 0 ? categories[0].id : ''
      });
      setPreviewUrl(null);
      setImageFile(null);
    }
  }, [product, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'isAvailable' 
        ? (name === 'isAvailable' ? value === 'true' : value === '' ? undefined : Number(value)) 
        : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || formData.price === undefined || formData.price < 0 || !formData.categoryId) {
        throw new Error('Harap isi semua field yang wajib diisi');
      }

      await onSubmit(formData as CreateProductData, imageFile);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan produk';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {product ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Harga *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price ?? ''}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="Contoh: kg, buah, liter"
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Kode unik produk"
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Kategori *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg"
                  disabled={loading || categories.length === 0}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status Ketersediaan
                </label>
                <select
                  name="isAvailable"
                  value={formData.isAvailable.toString()}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                >
                  <option value="true">Tersedia</option>
                  <option value="false">Habis</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Gambar Produk
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded-lg"
                    disabled={loading}
                  />
                </div>
                
                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Pratinjau Gambar:</p>
                    <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                      <Image 
                        src={previewUrl} 
                        alt="Preview" 
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized // Don't optimize local previews
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : (product ? 'Update' : 'Simpan')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}