export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export function buildApiUrl(path = '') {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
}

let isRedirecting = false;

async function request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    const config = {
        ...options,
        headers,
        credentials: options.credentials ?? 'include',
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

