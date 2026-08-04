const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Automatically ensure /api is appended if user enters base URL without /api
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export function buildApiUrl(path = '') {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
}

let isRedirecting = false;

async function request(url, options = {}) {
    let fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

    if (options.params && typeof options.params === 'object') {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                queryParams.append(key, val);
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
        }
    }

    const { params, ...fetchOptions } = options;

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions.headers || {}),
    };

    const config = {
        ...fetchOptions,
        headers,
        credentials: fetchOptions.credentials ?? 'include',
    };

    const response = await fetch(fullUrl, config);

    if (response.status === 401) {
        const onAuthPage = ['/login', '/signup'].includes(window.location.pathname);
        if (!isRedirecting && !onAuthPage) {
            isRedirecting = true;
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
    }

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const error = new Error(
            (typeof data === 'object' && data?.message) ||
            (typeof data === 'string' && data) ||
            `Request failed with status ${response.status}`
        );
        error.response = {
            status: response.status,
            data: data,
            headers: response.headers
        };
        throw error;
    }

    return { data, status: response.status, headers: response.headers };
}

const api = {
    get: (url, config) => request(url, { ...config, method: 'GET' }),
    post: (url, data, config) => request(url, { ...config, method: 'POST', body: JSON.stringify(data) }),
    put: (url, data, config) => request(url, { ...config, method: 'PUT', body: JSON.stringify(data) }),
    patch: (url, data, config) => request(url, { ...config, method: 'PATCH', body: JSON.stringify(data) }),
    delete: (url, config) => request(url, { ...config, method: 'DELETE' }),
};

export default api;
