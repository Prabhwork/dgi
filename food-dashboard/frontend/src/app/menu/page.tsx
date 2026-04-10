"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Clock, 
  AlertCircle,
  X,
  Camera,
  Users,
  Zap,
  ShieldAlert,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCatListModalOpen, setIsCatListModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [newCatName, setNewCatName] = useState('');
  const [newProduct, setNewProduct] = useState<any>({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    isVeg: true,
    prepTime: '15',
    description: '',
    ingredients: '',
    detailedDescription: '',
    images: [],
    coverImage: ''
  });

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      category: categories[0]?.name || '',
      price: '',
      originalPrice: '',
      isVeg: true,
      prepTime: '15',
      description: '',
      ingredients: '',
      detailedDescription: '',
      images: [],
      coverImage: ''
    });
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catData, prodData] = await Promise.all([
        api.get('/categories?all=true'),
        api.get('/products')
      ]);
      setCategories(catData);
      setProducts(prodData);
      if (catData.length > 0 && !newProduct.category) {
        setNewProduct((prev: any) => ({ ...prev, category: catData[0].name }));
      }
    } catch (err) {
      console.error('Failed to fetch menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAvailability = async (id: string) => {
    try {
      setProducts(prev => prev.map(p => p._id === id ? { ...p, available: !p.available } : p));
      await api.put(`/products/${id}/toggle`);
    } catch (err) {
      console.error('Toggle failed');
      fetchData();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name: newCatName });
      } else {
        await api.post('/categories', { name: newCatName });
      }
      setNewCatName('');
      setEditingCategory(null);
      setIsCategoryModalOpen(false);
      // Re-open category list if we were editing there
      if (editingCategory) setIsCatListModalOpen(true);
      fetchData();
    } catch (err) {
      console.error('Update category failed');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will remain but will be uncategorized.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete category failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check for banned names (Simulated server-side enforcement)
    const isBanned = products.find(p => p.name.toLowerCase() === newProduct.name.toLowerCase() && p.isBanned);
    if (isBanned && !editingProduct) {
        alert(`This item ("${newProduct.name}") has been banned by platform administration and cannot be re-added.\nReason: ${isBanned.banReason}`);
        return;
    }

    try {
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
        prepTime: Number(newProduct.prepTime)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      setIsProductModalOpen(false);
      resetProductForm();
      fetchData();
    } catch (err) {
      console.error('Save product failed');
    }
  };

  const handleUploadSlot = async (slotIdx: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use the centralized api utility to ensure Authorization headers are included
      const data = await api.post('/upload', formData);
      
      const updatedImages = [...(newProduct.images || [])];
      updatedImages[slotIdx] = data.url;
      
      // If this is the first image, or no cover is set, set it as cover
      let newCover = newProduct.coverImage;
      if (!newCover || updatedImages.length <= 1) {
        newCover = data.url;
      }

      setNewProduct({ ...newProduct, images: updatedImages, coverImage: newCover });
    } catch (err) {
      console.error('Slot upload failed:', err);
      alert('Failed to upload image. Please check your connection or login status.');
    }
  };

  const removeImage = (idx: number) => {
    const updatedImages = [...newProduct.images];
    const removedUrl = updatedImages[idx];
    updatedImages.splice(idx, 1);
    
    let newCover = newProduct.coverImage;
    if (newCover === removedUrl) {
      newCover = updatedImages[0] || '';
    }
    
    setNewProduct({ ...newProduct, images: updatedImages, coverImage: newCover });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete product failed');
    }
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      isVeg: product.isVeg,
      prepTime: product.prepTime.toString(),
      description: product.description || '',
      ingredients: product.ingredients || '',
      detailedDescription: product.detailedDescription || '',
      images: product.images || [product.image],
      coverImage: product.coverImage || product.image
    });
    setImagePreview(product.coverImage || product.image);
    setIsProductModalOpen(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setNewCatName(cat.name);
    setIsCatListModalOpen(false);
    setIsCategoryModalOpen(true);
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
       <div className="flex items-center justify-center h-[80vh]">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Menu Management</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">Add, edit or disable your food items</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCatListModalOpen(true)}
            className="bg-white border border-slate-200 px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Users size={16} /> Manage Categories
          </button>
          <button 
            onClick={() => {
              resetProductForm();
              setIsProductModalOpen(true);
            }}
            className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Categories & Global Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide px-2">
          {['All', ...categories.map(c => c.name)].map((cat, idx) => (
            <button
              key={`${cat}-${idx}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72 px-2 lg:px-4">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search menu item..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product._id}
              className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group ${!product.available ? 'grayscale-[0.5]' : ''}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={product.coverImage || product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {!product.available && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                      <div className="bg-white/10 p-3 rounded-full border border-white/20 mb-2">
                         <AlertCircle className="text-white" size={24} />
                      </div>
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Temporarily</span>
                      <span className="text-white text-xl font-black italic uppercase">Sold Out</span>
                   </div>
                )}

                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm z-30">
                  <div className={`w-3 h-3 rounded-sm border-2 ${product.isVeg ? 'border-emerald-500' : 'border-red-500'} flex items-center justify-center p-0.5`}>
                    <div className={`w-full h-full rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-800">{product.isVeg ? 'Veg' : 'Non-Veg'}</span>
                </div>

                {product.isBanned && (
                    <div className="absolute inset-0 bg-red-600/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                       <div className="bg-white/20 p-3 rounded-full border border-white/30 mb-2 font-black italic shadow-lg">
                          <Ban className="text-white" size={24} />
                       </div>
                       <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Platform</span>
                       <span className="text-white text-xl font-black italic uppercase leading-none">BANNED</span>
                    </div>
                 )}
                
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {!product.isBanned && (
                      <button 
                        onClick={() => openEditProduct(product)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-lg hover:text-primary transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-lg hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 leading-tight truncate max-w-[150px]">{product.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-800 leading-none block">
                      ₹{product.originalPrice ? Math.min(product.price, product.originalPrice) : product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs font-bold text-slate-300 line-through block">
                        ₹{Math.max(product.price, product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{product.prepTime} Min Prep</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase ${product.available ? 'text-primary' : 'text-slate-300'}`}>Availability</span>
                    <button 
                      onClick={() => toggleAvailability(product._id)}
                      className={`w-10 h-5 rounded-full p-1 transition-all flex items-center ${product.available ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${product.available ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No products found in this category</div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
               {/* Modal Header - Fixed */}
               <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white z-10 border-b border-transparent">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 italic uppercase">{editingProduct ? 'Edit Dish' : 'Add New Dish'}</h3>
                    <p className="text-xs font-bold text-slate-400">{editingProduct ? 'Update your item details' : 'Add a premium item to your menu catalogues'}</p>
                  </div>
                  <button onClick={() => { setIsProductModalOpen(false); resetProductForm(); }} className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition-all active:scale-90"><X size={20} /></button>
               </div>

               {/* Scrollable Form Content */}
               <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">

                <form className="space-y-6" onSubmit={handleAddProduct}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Dish Name</label>
                       <input 
                         type="text" 
                         required
                         value={newProduct.name}
                         onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                         placeholder="e.g., Paneer Butter Masala" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Category</label>
                       <select 
                         required
                         value={newProduct.category}
                         onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none"
                       >
                          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">Base Price (Original) (₹)</label>
                       <input 
                         type="number" 
                         value={newProduct.originalPrice}
                         onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                         placeholder="100" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic font-bold">Current Selling Price (₹)</label>
                       <input 
                         type="number" 
                         required
                         value={newProduct.price}
                         onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                         placeholder="50" 
                         className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 focus:outline-none placeholder:text-emerald-300" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Veg / Non-Veg</label>
                       <div className="flex bg-slate-50 rounded-2xl p-1">
                          <button 
                            type="button" 
                            onClick={() => setNewProduct({ ...newProduct, isVeg: true })}
                            className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${newProduct.isVeg ? 'bg-white shadow-sm text-emerald-500' : 'text-slate-400'}`}
                          >Veg</button>
                          <button 
                            type="button" 
                            onClick={() => setNewProduct({ ...newProduct, isVeg: false })}
                            className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${!newProduct.isVeg ? 'bg-white shadow-sm text-red-500' : 'text-slate-400'}`}
                          >Non-Veg</button>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Prep Time (Mins)</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="number" 
                            value={newProduct.prepTime}
                            onChange={(e) => setNewProduct({ ...newProduct, prepTime: e.target.value })}
                            placeholder="15" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:outline-none" 
                          />
                       </div>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Dish Images (Max 3)</label>
                       <span className="text-[9px] font-bold text-slate-400">Marked as <Zap size={10} className="inline text-primary fill-primary" /> shows as cover</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       {[0, 1, 2].map((idx) => (
                          <div key={idx} className="relative group">
                             <div 
                                className={`aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-2 ${newProduct.images[idx] ? 'border-primary/20 bg-white' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                             >
                                {newProduct.images[idx] ? (
                                   <>
                                      <img src={newProduct.images[idx]} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                         <button 
                                            type="button"
                                            onClick={() => setNewProduct({ ...newProduct, coverImage: newProduct.images[idx] })}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${newProduct.coverImage === newProduct.images[idx] ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-primary hover:text-white'}`}
                                         >
                                            <Zap size={14} fill={newProduct.coverImage === newProduct.images[idx] ? "currentColor" : "none"} />
                                         </button>
                                         <button 
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                         >
                                            <Trash2 size={14} />
                                         </button>
                                      </div>
                                      {newProduct.coverImage === newProduct.images[idx] && (
                                         <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                            <Zap size={10} fill="currentColor" />
                                         </div>
                                      )}
                                   </>
                                ) : (
                                   <button 
                                      type="button"
                                      onClick={() => {
                                         const input = document.createElement('input');
                                         input.type = 'file';
                                         input.accept = 'image/*';
                                         input.onchange = (e: any) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadSlot(idx, file);
                                         };
                                         input.click();
                                      }}
                                      className="flex flex-col items-center gap-1"
                                   >
                                      <Camera className="text-slate-300" size={20} />
                                      <span className="text-[8px] font-black uppercase text-slate-400">Add</span>
                                   </button>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Ingredients</label>
                     <textarea 
                        value={newProduct.ingredients}
                        onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })}
                        placeholder="e.g., Flour, Mozzarella, Tomato Sauce, Oregano..." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none h-20 resize-none" 
                      />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Detailed Product Info</label>
                     <textarea 
                        value={newProduct.detailedDescription}
                        onChange={(e) => setNewProduct({ ...newProduct, detailedDescription: e.target.value })}
                        placeholder="Nutritional facts, allergy info, or chef's secret..." 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none h-32 resize-none" 
                      />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-bold text-slate-400 leading-relaxed italic border-l-4 border-primary/20 pl-4 max-w-[250px]">Upload high-res photos to increase conversion.</p>
                    <button type="submit" className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                      {editingProduct ? 'Save Changes' : 'Add to Menu catalogue'}
                    </button>
                  </div>
                </form>
               </div>
            </motion.div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
            >
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800 italic uppercase">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                  <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setNewCatName(''); }} className="p-1.5 border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50"><X size={16} /></button>
               </div>
               <form className="space-y-6" onSubmit={handleAddCategory}>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">Category Name</label>
                     <input 
                        type="text" 
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g., Momos, Thali, Desserts" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none" 
                     />
                  </div>
                  <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}

        {/* Category Management List Modal */}
        {isCatListModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatListModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 italic uppercase">Manage Categories</h3>
                    <p className="text-xs font-bold text-slate-400">Total {categories.length} categories active</p>
                  </div>
                  <button onClick={() => setIsCatListModalOpen(false)} className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
               </div>

               <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
                  {categories.map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '20' }}>{cat.icon || '🍛'}</div>
                          <span className="text-sm font-black text-slate-800 uppercase italic">{cat.name}</span>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => openEditCategory(cat)}
                            className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <button 
                onClick={() => { setIsCatListModalOpen(false); setIsCategoryModalOpen(true); }}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <Plus size={16} /> Create New Category
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
