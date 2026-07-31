import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// Products
export const getProducts = () => API.get("/api/products");
export const addProduct = (data) => API.post("/api/products", data);

// Safe fallback for update/delete if backend routes are missing
export const updateProduct = async (id, data) => {
  try {
    return await API.put(`/api/products/${id}`, data);
  } catch (err) {
    // If backend route doesn't exist, we fallback or use POST/Patch
    return await API.post(`/api/products/update/${id}`, data).catch(() => {
      throw err;
    });
  }
};

export const deleteProduct = (id) => API.delete(`/api/products/${id}`);
export const getProductsBySeller = (sellerId) =>
  API.get(`/api/products/seller/${sellerId}`);

export const getSellerStats = (sellerId) =>
  API.get(`/api/seller/stats/${sellerId}`);

// Auth
export const registerSeller = (data) => API.post("/api/auth/register", data);

// Orders
export const createOrder = (data) => API.post("/api/orders", data);

export default API;
