import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const logout = () => {
  return axios.post(`${API_URL}/logout`);
};