"use client";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/userContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, PlusCircle, ArrowLeft, XCircle, CheckCircle } from "lucide-react";
import axios from "axios";

export default function AddProductPage() {
  const { user } = useUser();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
  });

  // Common categories list
  const categories = ["Painting", "Sculpture", "Photography", "Digital Art", "Prints", "Other"];

  // --- Auth Guard Effect ---
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/allProducts");
      return;
    }
  }, [user, router]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAlertMessage(null); // Clear previous alerts

    // Simple validation
    if (!formData.image) {
      setAlertMessage({ type: 'error', message: "Please select an image for the product." });
      setAdding(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("image", formData.image); 

    try {
      await axios.post("/api/admin/add", data, { withCredentials: true });

      setAlertMessage({ type: 'success', message: "Product added successfully! Redirecting..." });
      // Reset form after successful submission
      setFormData({ name: "", description: "", price: "", category: "", image: null });
      // Redirect after a short delay to show success message
      setTimeout(() => router.push("/admin"), 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      setAlertMessage({ type: 'error', message: "Failed to connect to server." });
    } finally {
      setAdding(false);
    }
  };

  // --- UI: Main Content ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">

        {/* Header and Back Button */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PlusCircle className="w-7 h-7 mr-3 text-indigo-600" />
            Add New Art Piece
          </h1>
          <Link
            href="/admin"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <div className={`p-4 mb-6 rounded-lg font-medium flex items-center ${
            alertMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {alertMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
            {alertMessage.message}
          </div>
        )}

        {/* Add Product Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Title / Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 'The Starry Night' Replica"
            />
          </div>

          {/* Price */}
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
              placeholder="e.g., 599.99"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
            >
              <option value="" disabled>Select the type of art</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Description */}
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
              placeholder="Provide a detailed description of the art piece, materials, and size."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Product Image (Required)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {formData.image && (
                <p className="mt-2 text-sm text-green-600">Selected: {formData.image.name}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={adding}
              className="flex items-center justify-center w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold shadow-xl hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
            >
              {adding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create New Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}