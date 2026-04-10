'use client';

import React, { useEffect, useState } from 'react';
import { usePartner } from '@/app/lib/PartnerContext';
import { api } from '@/app/lib/api';
import { Building2, ChevronDown, Check, Globe } from 'lucide-react';

interface Partner {
  id: string;
  businessName: string;
}

const PartnerSwitcher = () => {
  const { selectedPartner, setSelectedPartner, isGlobal } = usePartner();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await api.get('/admin/partners');
        setPartners(data);
      } catch (err) {
        console.error('Failed to fetch partners', err);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="relative px-4 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
      >
        <div className="flex items-center gap-2 overflow-hidden text-left">
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center text-white">
            <Building2 size={18} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1">Business Context</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {selectedPartner?.businessName || 'Select Partner'}
            </p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-4 right-4 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 max-h-64 overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1 leading-none">
              Select Restaurant
            </div>
            {partners.map((partner) => (
              <button
                key={partner.id}
                onClick={() => {
                  setSelectedPartner(partner);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedPartner?.id === partner.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 size={16} />
                  <span className="truncate">{partner.businessName}</span>
                </div>
                {selectedPartner?.id === partner.id && <Check size={16} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerSwitcher;
