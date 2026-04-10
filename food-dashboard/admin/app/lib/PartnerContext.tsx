'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface Partner {
  id: string;
  businessName: string;
}

interface PartnerContextType {
  selectedPartner: Partner | null;
  setSelectedPartner: (partner: Partner | null) => void;
  isGlobal: boolean;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPartner, setSelectedPartnerState] = useState<Partner | null>(null);

  // Load from localStorage on mount or pick default
  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('selectedPartner');
      if (saved) {
        try {
          setSelectedPartnerState(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved partner", e);
        }
      } else {
        // PRO TIP: Pick the first available partner if none selected
        try {
          const partners = await api.get('/admin/partners');
          if (partners && partners.length > 0) {
            setSelectedPartnerState(partners[0]);
            localStorage.setItem('selectedPartner', JSON.stringify(partners[0]));
          }
        } catch (err) {
          console.error("Failed to fetch initial partners", err);
        }
      }
    };
    init();
  }, []);

  const setSelectedPartner = (partner: Partner | null) => {
    setSelectedPartnerState(partner);
    if (partner) {
      localStorage.setItem('selectedPartner', JSON.stringify(partner));
    } else {
      localStorage.removeItem('selectedPartner');
    }
    // Refresh the page to ensure all components refetch with the new header
    window.location.reload();
  };

  const isGlobal = !selectedPartner;

  return (
    <PartnerContext.Provider value={{ selectedPartner, setSelectedPartner, isGlobal }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
};
