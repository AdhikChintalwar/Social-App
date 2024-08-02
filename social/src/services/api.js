import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8082',
});

export default API;
