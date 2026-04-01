export interface MainCategory {
    _id: string;
    name: string;
    description: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Category {
    _id: string;
    name: string;
    description: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Subcategory {
    _id: string;
    name: string;
    category: string | { _id: string; name: string; description: string };
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface Feature {
    _id: string;
    category: string | { _id: string; name: string; description: string };
    isActive: boolean;
    createdAt: string;
}

export interface Solution {
    _id: string;
    category: string | { _id: string; name: string; description: string };
    isActive: boolean;
    createdAt: string;
}

export interface AdminUser {
    _id: string;
    email: string;
}

export interface PageDetail {
    _id: string;
    category: string | { _id: string; name: string };
    subcategory: string | { _id: string; name: string };
    description: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Contact {
    _id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    createdAt: string;
}

export interface UpcomingCategory {
    _id: string;
    title: string;
    icon: string;
    description?: string;
    image?: string;
    category?: string | { _id: string; name: string };
    order: number;
    isActive: boolean;
    createdAt: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
}

export interface Testimonial {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    quote: string;
    rating: number;
    isActive: boolean;
    createdAt: string;
}

export interface ExistingCustomer {
    _id: string;
    name: string;
    logo?: string;
    link?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

export interface FunnelOption {
    label: string;
    icon: string;
    color: string;
}

export interface FunnelQuestion {
    _id: string;
    question: string;
    options: FunnelOption[];
    order: number;
    isActive: boolean;
    createdAt: string;
}

export interface FunnelLead {
    _id: string;
    name: string;
    phone: string;
    email: string;
    businessName: string;
    description: string;
    answers: Record<string, string>;
    status: 'new' | 'contacted' | 'qualified' | 'closed';
    createdAt: string;
}
