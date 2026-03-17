const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
console.log("API:", import.meta.env.VITE_API_BASE_URL);

// Base headers to bypass ngrok landing page
const getHeaders = (extra = {}) => ({
  'ngrok-skip-browser-warning': 'true',
  ...extra
});

export const api = {
  getDevices: async () => {
    const res = await fetch(`${API_BASE_URL}/adb/devices`, { headers: getHeaders() });
    return res.json();
  },
  getPackages: async () => {
    const res = await fetch(`${API_BASE_URL}/adb/packages`, { headers: getHeaders() });
    return res.json();
  },
  getLogcat: async (lines = 1000, pkg = null) => {
    const url = new URL(`${API_BASE_URL}/adb/logcat`);
    url.searchParams.append('lines', lines);
    if (pkg) url.searchParams.append('package', pkg);

    const res = await fetch(url.toString(), { headers: getHeaders() });
    return res.json();
  },
  analyzeApk: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/apk/analyze`, { 
      method: 'POST', 
      body: formData,
      headers: getHeaders()
    });
    return res.json();
  },
  installApk: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/adb/install`, { 
      method: 'POST', 
      body: formData,
      headers: getHeaders()
    });
    return res.json();
  },
  uninstallApk: async (pkg) => {
    const res = await fetch(`${API_BASE_URL}/adb/uninstall`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ package: pkg })
    });
    return res.json();
  }
};
