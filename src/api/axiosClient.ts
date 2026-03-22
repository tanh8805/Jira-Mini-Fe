import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const resolveApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL
  const fallbackUrl = 'https://jirabackend.io.vn'

  return (configuredUrl ?? fallbackUrl)
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '')
}

const API_BASE_URL = resolveApiBaseUrl()
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  accessToken: string
}

type QueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

const refreshHttp = axios.create({
  baseURL: API_BASE_URL,
})

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
})

let isRefreshing = false
let failedQueue: QueueItem[] = []

const isAuthRequest = (url?: string): boolean => {
  if (!url) {
    return false
  }

  return /\/api\/auth\//i.test(url)
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const setAuthTokens = (
  accessToken: string,
  refreshToken?: string,
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

const redirectToLogin = (): void => {
  window.location.replace('/login')
}

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((pendingRequest) => {
    if (error) {
      pendingRequest.reject(error)
      return
    }

    if (token) {
      pendingRequest.resolve(token)
      return
    }

    pendingRequest.reject(new Error('No access token available after refresh'))
  })

  failedQueue = []
}

const refreshAccessToken = async (): Promise<RefreshResponse> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('Refresh token is missing')
  }

  const response = await refreshHttp.post<RefreshResponse>(
    '/api/auth/refresh',
    undefined,
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  )

  return response.data
}

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken && !isAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosClient(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { accessToken } = await refreshAccessToken()

      setAuthTokens(accessToken)
      processQueue(null, accessToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return axiosClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthTokens()
      redirectToLogin()

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosClient