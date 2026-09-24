'use client';

import React, { useState } from 'react';

export default function AddProductForm() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add product submission logic here
    console.log('Submitting product:', product);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-md border border-gray-800 my-8">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-200">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={product.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Headphones"
            className="block rounded-md w-full bg-white/5 px-3 py-2 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-gray-200">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={product.description}
            onChange={handleChange}
            placeholder="Describe the product details..."
            className="block rounded-md w-full bg-white/5 px-3 py-2 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className="block text-sm font-medium text-gray-200">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={product.price}
              onChange={handleChange}
              placeholder="0.00"
              className="block rounded-md w-full bg-white/5 px-3 py-2 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
            />
          </div>

          {/* Stock */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="stock" className="block text-sm font-medium text-gray-200">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              min="0"
              value={product.stock}
              onChange={handleChange}
              placeholder="0"
              className="block rounded-md w-full bg-white/5 px-3 py-2 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
            />
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="block text-sm font-medium text-gray-200">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="block rounded-md w-full bg-gray-900 px-3 py-2 text-white outline-1 outline-white/10 focus:outline-indigo-500"
          >
            <option value="" disabled>Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Kitchen</option>
            <option value="books">Books</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Image URL */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-200">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="block rounded-md w-full bg-white/5 px-3 py-2 placeholder:text-gray-500 text-white outline-1 outline-white/10 focus:outline-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
