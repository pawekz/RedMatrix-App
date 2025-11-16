/*const DEFAULT_API_BASE_URL = 'http://localhost:8080'*/
const DEFAULT_API_BASE_URL = 'https://backend-notes-app-redmatrix-oxjc2.ondigitalocean.app/'

export const API_BASE_URL = import.meta.env?.VITE_API_URL ?? DEFAULT_API_BASE_URL

export const ENDPOINTS = {
  notes: `${API_BASE_URL}/api/notes`,
}

export const noteUrl = (id) => `${ENDPOINTS.notes}${id ? `/${id}` : ''}`
