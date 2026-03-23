import axiosClient, {
  clearAuthTokens,
  getAccessToken,
  setAuthTokens,
} from '../../api/axiosClient'
import { unwrapApiData } from '../../api/response'

const USER_DISPLAY_LABEL_KEY = 'userDisplayLabel'

export interface AuthResponse {
  message: string
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
}

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>('/api/auth/login', payload)
  const data = unwrapApiData(response.data) as AuthResponse

  setAuthTokens(data.accessToken, data.refreshToken)
  return data
}

export const registerApi = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await axiosClient.post<RegisterResponse>(
    '/api/auth/register',
    payload,
  )

  return (unwrapApiData(response.data) as RegisterResponse) ?? response.data
}

export const setUserDisplayLabel = (label: string): void => {
  localStorage.setItem(USER_DISPLAY_LABEL_KEY, label)
}

export const getUserDisplayLabel = (): string => {
  return localStorage.getItem(USER_DISPLAY_LABEL_KEY) ?? 'Account'
}

export const clearUserDisplayLabel = (): void => {
  localStorage.removeItem(USER_DISPLAY_LABEL_KEY)
}

export const logoutApi = async (): Promise<void> => {
  const accessToken = getAccessToken()

  try {
    await axiosClient.post('/api/auth/logout', undefined, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    })
  } finally {
    clearAuthTokens()
    clearUserDisplayLabel()
  }
}