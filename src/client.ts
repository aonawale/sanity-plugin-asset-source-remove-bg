/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios from 'axios'

import {AccountResponse, ImageResponse, RemoveBgPayload, ServiceConfig} from './types'

const removeBgAxiosClient = axios.create({
  baseURL: 'https://api.remove.bg/v1.0',
})

const pixelCutAiAxiosClient = axios.create({
  baseURL: 'https://api.developer.pixelcut.ai/v1',
})

const photoRoomAxiosClient = axios.create({
  baseURL: 'https://sdk.photoroom.com/v1',
})

export function fetchCreditBalance(apiKey: string): Promise<AccountResponse> {
  return removeBgAxiosClient
    .get('/account', {
      headers: {
        'X-API-Key': apiKey,
      },
    })
    .then((response) => response.data.data.attributes)
    .catch((error) => error.response.data)
}

export function removeBgBackground(
  apiKey: string,
  payload: RemoveBgPayload,
): Promise<ImageResponse> {
  return removeBgAxiosClient
    .post(
      '/removebg',
      {
        image_url: payload.url,
        format: payload.format,
        size: payload.size,
      },
      {
        headers: {
          Accept: 'application/json',
          'X-API-Key': apiKey,
        },
      },
    )
    .then((response) => ({
      data: {
        ...response.data.data,
        url: `data:image/png;base64,${response.data.data.result_b64}`,
      },
    }))
    .catch((error) => error.response.data)
}

export function pixelCutRemoveBackground(
  apiKey: string,
  payload: RemoveBgPayload,
): Promise<ImageResponse> {
  return pixelCutAiAxiosClient
    .post(
      '/remove-background',
      {
        image_url: payload.url,
        format: payload.format,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-KEY': apiKey,
        },
      },
    )
    .then((response) => ({
      data: {
        ...response.data,
        url: response.data.result_url,
      },
    }))
    .catch((error) => [
      {
        title: error.response.data.error,
        code: error.response.data.error_code,
      },
    ])
}

export async function photoRoomRemoveBackground(
  apiKey: string,
  payload: RemoveBgPayload,
): Promise<ImageResponse> {
  const form = new FormData()

  const imageResponse = await axios.get(payload.url || '', {responseType: 'blob'})

  form.append('image_file', imageResponse.data)
  form.append('format', payload.format || '')
  form.append('size', payload.size || '')

  return photoRoomAxiosClient
    .post('/segment', form, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
        'x-api-key': 'sandbox_sk_pr_default_e426978f37900980629c0d018f410134c4140bbc',
      },
    })
    .then((response) => ({
      data: {
        ...response.data,
        url: `data:image/png;base64,${response.data.result_b64}`,
      },
    }))
    .catch((error) => {
      return {
        errors: [
          {
            title: error.response.data?.detail,
            code: error.response.data?.status_code?.toString(),
          },
        ],
      }
    })
}

export const removeBackground = async (
  payload: RemoveBgPayload & {
    removeBg?: ServiceConfig
    pixelCutAi?: ServiceConfig
    photoRoom?: ServiceConfig
  },
) => {
  const serviceConfig = {
    removeBg: payload.removeBg,
    pixelCutAi: payload.pixelCutAi,
    photoRoom: payload.photoRoom,
  }

  const apiKey = serviceConfig[payload.service]?.apiKey || ''

  if (payload.service === 'pixelCutAi') {
    return pixelCutRemoveBackground(apiKey, payload)
  }
  if (payload.service === 'photoRoom') {
    return photoRoomRemoveBackground(apiKey, payload)
  }
  return removeBgBackground(apiKey, payload)
}
