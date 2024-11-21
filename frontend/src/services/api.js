import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const getHelloMessage = async (name) => {
  try {
    const response = await axios.get(`${API_URL}/hello?name=${name}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hello message:', error);
  }
};