const API_URL = "/api";

const headers = () => ({
  "Content-Type": "application/json",
});

// Helper for requests with credentials (cookies)
const fetchWithAuth = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include", // Important: This sends the HttpOnly cookie
    headers: {
      ...headers(),
      ...options.headers,
    },
  });
};

export const api = {
  login: async (apiKey: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ apiKey }),
    });

    if (res.status === 401) throw new Error("Invalid API Key");
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  logout: async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  },

  checkAuth: async () => {
    // Try to fetch projects as a lightweight auth check
    const res = await fetchWithAuth(`${API_URL}/projects`);
    if (res.status === 401) return false;
    if (!res.ok) return false; // Other errors might mean server down, but auth is arguably failed too
    return true;
  },

  getProjects: async () => {
    const res = await fetchWithAuth(`${API_URL}/projects`);
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },

  getEnvironments: async (project: string) => {
    const res = await fetchWithAuth(`${API_URL}/projects/${project}/envs`);
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },

  getEnvVars: async (project: string, env: string) => {
    const res = await fetchWithAuth(
      `${API_URL}/projects/${project}/env/${env}`,
    );
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) return { variables: {}, lastModified: null };
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },

  saveEnvVars: async (
    project: string,
    env: string,
    variables: Record<string, string>,
  ) => {
    const res = await fetchWithAuth(
      `${API_URL}/projects/${project}/env/${env}`,
      {
        method: "POST",
        body: JSON.stringify({ variables }),
      },
    );
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },

  deleteProject: async (project: string) => {
    const res = await fetchWithAuth(`${API_URL}/projects/${project}`, {
      method: "DELETE",
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },
};
