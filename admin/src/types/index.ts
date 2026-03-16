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

export interface PaginationInfo {
    page: number;
    limit: number;
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
}
