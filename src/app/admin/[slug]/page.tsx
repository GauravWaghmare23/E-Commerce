"use client";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "../../../context/userContext";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Loader2, Trash2, Save, X, ArrowLeft, Image as ImageIcon } from "lucide-react";


interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}


export default function AdminProductDetail() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
  });

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setAlertMessage(null);
    try {
      const res = await axios.get(`/api/user/product/${slug}`, { withCredentials: true });
      setProduct(res.data.product);
      setFormData({
        name: res.data.product.name,
        description: res.data.product.description,
        price: res.data.product.price.toString(),
        category: res.data.product.category,
        image: null,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      setAlertMessage({ type: 'error', message: "Error connecting to server." });
    } finally {
      setLoading(false);
    }
  }, [slug]);


  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/allProducts");
      return;
    }
    fetchProduct();
  }, [user, router, slug, fetchProduct]);

 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setAlertMessage(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await axios.put(`/api/admin/update/${slug}`, data, { withCredentials: true });
      setAlertMessage({ type: 'success', message: "Product updated successfully!" });
      fetchProduct(); // Refresh product data
    } catch (error) {
      console.error("Error updating product:", error);
      setAlertMessage({ type: 'error', message: "Failed to connect to server for update." });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete '${product?.name}'?`)) return;

    setDeleting(true);
    setAlertMessage(null);
    try {
      await axios.delete(`/api/admin/delete/${slug}`, { withCredentials: true });
      alert("Product deleted successfully! Redirecting to dashboard.");
      router.push("/admin");
    } catch (error) {
      console.error("Error deleting product:", error);
      setAlertMessage({ type: 'error', message: "Failed to connect to server for deletion." });
    } finally {
      setDeleting(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="ml-4 text-lg text-gray-600">Loading Product Data...</p>
      </div>
    );
  }

  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <X className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-6">Product not found</p>
        <button
            onClick={() => router.push("/admin")}
            className="flex items-center text-white bg-indigo-600 px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go to Admin Dashboard
        </button>
      </div>
    );
  }

  
  const categories = ["Painting", "Sculpture", "Photography", "Digital Art", "Prints", "Other"];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">

        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Product: <span className="text-indigo-600">{product.name}</span>
          </h1>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </button>
        </div>

        
        {alertMessage && (
          <div className={`p-4 mb-6 rounded-lg font-medium ${
            alertMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {alertMessage.message}
          </div>
        )}

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          
          <div className="lg:order-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Image</h2>
            <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-lg border border-gray-300">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <ImageIcon className="w-8 h-8 mr-2" />
                    No Image Available
                </div>
              )}
            </div>
            {formData.image && (
                <p className="mt-2 text-sm text-green-600">New image selected: {formData.image.name}</p>
            )}
          </div>

          
          <form onSubmit={handleUpdate} className="space-y-6 lg:order-1">
            
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Change Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            
            <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={updating}
                className="flex items-center justify-center w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Product
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition duration-150 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}