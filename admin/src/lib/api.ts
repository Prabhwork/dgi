const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
        ...getHeaders(),
        ...(options.headers as Record<string, string>),
    };

    if (isFormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};
