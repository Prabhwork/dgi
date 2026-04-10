/**
 * Central API Utility for Food Dashboard
 * Connects the Next.js frontend to the Express/MongoDB backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Lock: prevents multiple concurrent 401 responses from each triggering a /logout redirect
let isRedirectingToLogout = false;

export const api = {
  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Multi-tenant header injection & Security
    const token = typeof window !== 'undefined' ? localStorage.getItem('businessToken') : null;
    const partnerId = typeof window !== 'undefined' ? localStorage.getItem('partnerId') : null;
    
    const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;

    const headers: any = {
      'Content-Type': 'application/json',
      'x-partner-id': partnerId,
      ...options.headers,
    };

    // If it's FormData, we must let the browser set the Content-Type with boundary
    if (isFormData || headers['Content-Type'] === 'SKIP') {
      delete headers['Content-Type'];
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (
              !currentPath.startsWith('/logout') &&
              !currentPath.startsWith('/login') &&
              !isRedirectingToLogout
            ) {
                // Only one 401 triggers the logout redirect
                isRedirectingToLogout = true;
                window.location.href = '/logout';
                return;
            }
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },


  // GET requests
  get(endpoint: string, options: { params?: Record<string, any> } = {}) {
    let url = endpoint;
    if (options.params) {
      const query = new URLSearchParams(options.params).toString();
      url += (url.includes('?') ? '&' : '?') + query;
    }
    return this.request(url, { method: 'GET' });
  },

  // POST requests
  post(endpoint: string, body: any, options: { headers?: Record<string, string> } = {}) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...(isFormData ? { 'Content-Type': 'SKIP' } : {}),
        ...options.headers,
      },
    });
  },

  // PUT requests
  put(endpoint: string, body: any = {}, options: { headers?: Record<string, string> } = {}) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...(isFormData ? { 'Content-Type': 'SKIP' } : {}),
        ...options.headers,
      },
    });
  },

  // PATCH requests
  patch(endpoint: string, body: any = {}, options: { headers?: Record<string, string> } = {}) {
    const isFormData = typeof window !== 'undefined' && body instanceof FormData;
    return this.request(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
      headers: {
        ...(isFormData ? { 'Content-Type': 'SKIP' } : {}),
        ...options.headers,
      },
    });
  },

  // DELETE requests
  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
