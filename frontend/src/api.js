import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://kotla-marketplace-backend-production.up.railway.app",
});

export const getProducts = () => API.get("/api/products");
export const addProduct = (data) => API.post("/api/products", data);
export const updateProduct = (id, data) => API.put(`/api/products/${id}`, data);
export const deleteProduct = (id, data) =>
  API.delete(`/api/products/${id}`, { data });
export const getProductsBySeller = (sellerId) =>
  API.get(`/api/products/seller/${sellerId}`);

export const getSellerStats = (sellerId) =>
  API.get(`/api/seller/stats/${sellerId}`);

export const registerSeller = (data) => API.post("/api/auth/register", data);

export const createOrder = (data) => API.post("/api/orders", data);

export const getAddresses = async (userId) => {
  try {
    const response = await API.get(`/api/addresses/${userId}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching addresses:", err);
    return [];
  }
};

export const addAddress = async (data) => {
  try {
    const response = await API.post("/api/addresses", data);
    return response.data;
  } catch (err) {
    console.error("Error saving address:", err);
    throw err;
  }
};

export default API;
