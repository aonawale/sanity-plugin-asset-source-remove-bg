import {AssetSourceComponentProps} from 'sanity'

export interface ServiceConfig {
  apiKey: string
}

export interface RemoveBgConfig {
  removeBg?: ServiceConfig
  photoRoom?: ServiceConfig
  allowedUserRoles?: string[]
}

export type RemoveBgProps = AssetSourceComponentProps & RemoveBgConfig

export enum ImageFormat {
  PNG = 'png',
  JPG = 'jpg',
  AUTO = 'auto',
}

export enum ImageSize {
  PREVIEW = 'preview',
  FULL = 'full',
  AUTO = 'auto',
}

export type Service = 'removeBg' | 'photoRoom'

export interface RemoveBgPayload {
  url?: string
  size?: ImageSize
  format?: ImageFormat
  service: Service
}

export type PixelCutAiPayload = {
  image_url: string
  format: string
}

export type Error = {
  title: string
  code?: string
  detail?: string
}
export interface AccountResponse {
  credits: {
    total: number
    subscription: number
    payg: number
    enterprise: number
  }
  api: {
    free_calls: number
  }
  errors?: Error[]
}

export interface RemoveBgResponse {
  data?: {
    result_b64: string
    foreground_top: number
    foreground_left: number
    foreground_width: number
    foreground_height: number
  }
  errors?: Error[]
}

export interface ImageResponse {
  data?: {
    url: string
    result_b64: string
    foreground_top: number
    foreground_left: number
    foreground_width: number
    foreground_height: number
  }
  errors?: Error[]
}

export interface FormProps {
  onSubmit: (payload: RemoveBgPayload) => void
  image: ImageResponse | undefined
  useImage: () => void
  discardImage: () => void
}
