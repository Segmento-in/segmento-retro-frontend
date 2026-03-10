export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Request deduplication cache
const pendingRequests = new Map();

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/*Handle API response*/
async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  let data;
  if (isJson) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const error = new Error(data?.message || data || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Generate cache key for request deduplication
function getCacheKey(method, url) {
  return `${method}:${url}`;
}

const api = {
  async get(endpoint, options = {}) {
    try {
      // Build URL with query parameters if provided
      let url = `${API_BASE_URL}${endpoint}`;
      if (options.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value);
          }
        });
        const queryString = params.toString();
        if (queryString) {
          url += (endpoint.includes('?') ? '&' : '?') + queryString;
        }
      }

      // Check if same request is already pending (deduplication)
      const cacheKey = getCacheKey('GET', url);
      if (pendingRequests.has(cacheKey)) {
        return await pendingRequests.get(cacheKey);
      }
      
      // Create new request promise
      const requestPromise = (async () => {
        try {
          const startTime = performance.now();
          const response = await fetch(url, {
            method: "GET",
            ...options,
            headers: {
              ...getAuthHeaders(),
              ...(options.headers || {}),
            },
          });
          const result = await handleResponse(response);
          return result;
        } finally {
          // Remove from pending requests after completion
          pendingRequests.delete(cacheKey);
        }
      })();

      // Store pending request
      pendingRequests.set(cacheKey, requestPromise);
      
      return await requestPromise;
    } catch (error) {
      throw error;
    }
  },

  /*POST request*/
  async post(endpoint, body, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /*PUT request*/
  async put(endpoint, body, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "PUT",
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /*PATCH request*/
  async patch(endpoint, body, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "PATCH",
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
        body: JSON.stringify(body),
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /*DELETE request*/
  async delete(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        method: "DELETE",
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
      });
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
};

export default api;
