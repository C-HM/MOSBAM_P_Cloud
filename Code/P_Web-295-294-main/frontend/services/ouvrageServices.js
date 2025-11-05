import UpdateBook from '@/components/updateBook.vue'
import axios from 'axios'

let token = localStorage.getItem('token') || null

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: token,
  },
})
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
})

export default {
  login(credentials) {
    return apiClient.post('/login', credentials).then((response) => {
      const newToken = response.data.token
      localStorage.setItem('token', `Bearer ${newToken}`)
      apiClient.defaults.headers.common['Authorization'] = localStorage.getItem('token') // Ajouter le token aux headers
      token = localStorage.getItem('token')
      return response
    })
  },

  getAllBooks(title = null) {
    if (title != null && title.title.length > 2) {
      return apiClient.get('/books?titre=' + title.title)
    }
    return apiClient.get('/books')
  },
  updateBook(id, data) {
    return apiClient.put(`/books/${id}`, data)
  },
  getBookById(id) {
    return apiClient.get(`/books/${id}`)
  },
  getAllAuthors() {
    return apiClient.get('/authors')
  },
  getAllCategories() {
    return apiClient.get('/categories/')
  },
  getUserById(id) {
    return apiClient.get(`/users/${id}`)
  },
  getCategorieById(id) {
    return apiClient.get(`/categories/${id}`)
  },
  getAuthorById(id) {
    return apiClient.get(`/authors/${id}`)
  },
  createBook(data) {
    return apiClient.post(`/books`, data)
  },
  uploadImage(formData) {
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getUserComments(userId) {
    return apiClient.get(`/users/${userId}/evaluations`)
  },
  register(credentials) {
    return apiClient.post('/login/register', credentials)
  },
  deleteBook(id) {
    return apiClient.delete(`/books/${id}`)
  },
  getComments(id) {
    return apiClient.get(`books/${id}/evaluations`)
  },
  deleteComment(id) {
    return apiClient.delete(`/evaluations/${id}`)
  },
  createComment(id, data) {
    return apiClient.post(`/books/${id}/evaluations`, data)
  },

  getBookUserById(id) {
    return apiClient.get(`/users/${id}/books`)
  },
}
