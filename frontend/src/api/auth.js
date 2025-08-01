import axios from 'axios'

const API = 'http://localhost:8000'

export const registerUser = (user) => axios.post(`${API}/auth/register`, user)
export const loginUser = (user) => axios.post(`${API}/auth/login`, user)
