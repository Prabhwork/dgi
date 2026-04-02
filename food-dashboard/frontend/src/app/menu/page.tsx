"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, PRODUCTS } from '@/lib/mockData';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Mock State for availability tracking
  const [localProducts, setLocalProducts] = useState(PRODUCTS);

  const toggleAvailability = (id: number) => {
    setLocalProducts(prev => prev.map(p => 
      p.id === id ? { ...p, available: !p.available } : p
    ));
  };

  const filteredProducts = activeCategory === 'All' 
    ? localProducts 
    : localProducts.filter(p => p.category === activeCategory);

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
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white border border-slate-200 px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Category
          </button>
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Categories & Global Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide px-2">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
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
              key={product.id}
              className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group ${!product.available ? 'grayscale-[0.5]' : ''}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {/* Out of Stock Overlay */}
                {!product.available && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                      <div className="bg-white/10 p-3 rounded-full border border-white/20 mb-2">
                         <AlertCircle className="text-white" size={24} />
                      </div>
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Temporarily</span>
                      <span className="text-white text-xl font-black italic uppercase">Sold Out</span>
                   </div>
                )}

                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm z-10">
                  <div className={`w-3 h-3 rounded-sm border-2 ${product.isVeg ? 'border-emerald-500' : 'border-red-500'} flex items-center justify-center p-0.5`}>
                    <div className={`w-full h-full rounded-full ${product.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-800">{product.isVeg ? 'Veg' : 'Non-Veg'}</span>
                </div>
                
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-lg hover:text-primary transition-colors"><Edit3 size={14} /></button>
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-lg hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 leading-tight truncate max-w-[150px]">{product.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-800 leading-none block">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs font-bold text-slate-300 line-through">₹{product.originalPrice}</span>
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
                      onClick={() => toggleAvailability(product.id)}
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
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Add Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 italic uppercase italic">Add New Dish</h3>
                    <p className="text-xs font-bold text-slate-400">Add a premium item to your menu catalogues</p>
                  </div>
                  <button onClick={() => setIsProductModalOpen(false)} className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50"><X size={20} /></button>
               </div>

               <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Dish Name</label>
                       <input type="text" placeholder="e.g., Paneer Butter Masala" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Category</label>
                       <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Base Price (₹)</label>
                       <input type="number" placeholder="299" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Veg / Non-Veg</label>
                       <div className="flex bg-slate-50 rounded-2xl p-1">
                          <button type="button" className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl bg-white shadow-sm text-emerald-500">Veg</button>
                          <button type="button" className="flex-1 py-3 text-[10px] font-black uppercase rounded-xl text-slate-400">Non-Veg</button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Item Description</label>
                     <textarea placeholder="Tell your customers about this dish..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none h-24 resize-none" />
                  </div>

                  {/* New: Customizations Section */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                     <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Variants & Add-ons</label>
                        <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:bg-white px-2 py-1 rounded-lg transition-all">
                           <Plus size={12} /> Add New Row
                        </button>
                     </div>
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Variation Name (e.g., Extra Cheese)" className="bg-white border border-slate-100 rounded-xl p-3 text-[10px] font-bold focus:outline-none" />
                           <input type="number" placeholder="Extra Price (₹)" className="bg-white border border-slate-100 rounded-xl p-3 text-[10px] font-bold focus:outline-none" />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="border-2 border-dashed border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/20 transition-colors">
                        <ImageIcon className="text-slate-200 mb-2" size={32} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload Food Photo</span>
                     </div>
                     <div className="space-y-4 flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic border-l-2 border-primary/20 pl-4">Use high-resolution photos of your actual food to increase bookings by up to 40%.</p>
                        <button type="button" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Add to Menu catalogue</button>
                     </div>
                  </div>
               </form>
            </motion.div>
          </div>
        )}

        {/* Add Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
            >
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800 italic uppercase">New Category</h3>
                  <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50"><X size={16} /></button>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic font-bold">Category Name</label>
                     <input type="text" placeholder="e.g., Momos, Thali, Desserts" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:outline-none" />
                  </div>
                  <button className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">Create Category</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
