import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://kotla-marketplace-backend-production.up.railway.app",
});

export const getProducts = () => API.get("/api/products");
export const addProduct = (data) => API.post("/api/products", data);

export const updateProduct = async (id, data) => {
  try {
    return await API.put(`/api/products/${id}`, data);
  } catch (err) {
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

export const registerSeller = (data) => API.post("/api/auth/register", data);

export const createOrder = (data) => API.post("/api/orders", data);

export default API;
