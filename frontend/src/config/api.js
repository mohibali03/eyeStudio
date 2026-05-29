export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Log in browser console so you can verify the correct URL is used on Render
console.log(`[API] BASE_URL = ${API_BASE_URL}`);
