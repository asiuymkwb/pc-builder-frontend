const backendUrl = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000").toString().trim()

const env = {
  backendUrl,
  apiUrl: `${backendUrl}/api`,
}

export default env
