import { Buffer } from 'node:buffer'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || ''

const ACTIVE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || ''

export const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'game-content'

export function isSupabaseEnabled() {
  const hasUrl = Boolean(SUPABASE_URL)
  const hasKey = Boolean(ACTIVE_KEY)
  const enabled = hasUrl && hasKey
  
  // Логируем только если не настроено (чтобы не спамить логи)
  if (!enabled && (hasUrl || hasKey)) {
    console.log('[Supabase] Проверка:', {
      hasUrl,
      hasKey,
      urlLength: SUPABASE_URL.length,
      keyLength: ACTIVE_KEY.length,
    })
  }
  
  return enabled
}

export function isVercelBlobEnabled() {
  const enabled = Boolean(BLOB_READ_WRITE_TOKEN)
  if (enabled && !BLOB_READ_WRITE_TOKEN.startsWith('vercel_blob_')) {
    console.warn('[Vercel Blob] Токен не начинается с "vercel_blob_", возможно неверный формат')
  }
  return enabled
}

function buildBaseHeaders() {
  const headers = new Headers()
  headers.set('apikey', ACTIVE_KEY)
  headers.set('Authorization', `Bearer ${ACTIVE_KEY}`)
  return headers
}

// Перегрузки для правильной типизации
export async function supabaseRestRequest<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    headers?: HeadersInit
    body?: any
    searchParams?: Record<string, string>
    expect?: 'json' | 'text'
  }
): Promise<T>
export async function supabaseRestRequest(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    headers?: HeadersInit
    body?: any
    searchParams?: Record<string, string>
    expect: 'void'
  }
): Promise<void>
export async function supabaseRestRequest<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    headers?: HeadersInit
    body?: any
    searchParams?: Record<string, string>
    expect?: 'json' | 'text' | 'void'
  } = {}
): Promise<T | void> {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase is not configured')
  }

  const { method = 'GET', headers: customHeaders, body, searchParams, expect = 'json' } = options
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`)

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const headers = buildBaseHeaders()
  if (customHeaders) {
    Object.entries(customHeaders).forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(key, value as string)
      }
    })
  }

  if (body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`)
  }

  if (expect === 'void') {
    return
  }

  if (expect === 'text') {
    return (await response.text()) as T
  }

  try {
    const text = await response.text()
    
    // Если ответ пустой - возвращаем подходящее значение
    if (!text.trim()) {
      if (expect === 'json') return [] as T  // для SELECT запросов
      return undefined as T
    }
    
    // Парсим JSON только если есть содержимое
    return JSON.parse(text) as T
  } catch (error) {
    console.error('[Supabase] JSON parse error:', error)
    throw new Error(`Supabase response parse error: ${error}`)
  }
}

export async function supabaseStorageUpload(
  objectPath: string,
  file: Buffer | ArrayBuffer,
  contentType: string,
  options: { upsert?: boolean } = {}
) {
  // Приоритет: Vercel Blob Storage, затем Supabase Storage
  if (isVercelBlobEnabled()) {
    return vercelBlobUpload(objectPath, file, contentType, options)
  }

  if (!isSupabaseEnabled()) {
    throw new Error('Storage is not configured (neither Vercel Blob nor Supabase)')
  }

  const url = new URL(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${objectPath.replace(/^\//, '')}`
  )
  if (options.upsert) {
    url.searchParams.set('upsert', 'true')
  }

  const headers = buildBaseHeaders()
  headers.set('Content-Type', contentType || 'application/octet-stream')
  if (options.upsert) {
    headers.set('x-upsert', 'true')
  }

  // Преобразуем в Uint8Array для совместимости с fetch API
  const body =
    file instanceof ArrayBuffer
      ? new Uint8Array(file)
      : file instanceof Buffer
      ? new Uint8Array(file)
      : new Uint8Array(file)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: body as BodyInit,
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase storage upload failed (${response.status}): ${errorText}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${objectPath.replace(/^\//, '')}`
}

async function vercelBlobUpload(
  objectPath: string,
  file: Buffer | ArrayBuffer,
  contentType: string,
  options: { upsert?: boolean } = {}
): Promise<string> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set')
  }

  const cleanPath = objectPath.replace(/^\//, '')
  
  // Используем официальный API endpoint Vercel Blob
  const url = `https://blob.vercel-storage.com/${cleanPath}`

  // Преобразуем в Uint8Array для совместимости с fetch API
  const body =
    file instanceof ArrayBuffer
      ? new Uint8Array(file)
      : file instanceof Buffer
      ? new Uint8Array(file)
      : new Uint8Array(file)

  const headers = new Headers()
  // Vercel Blob требует токен в заголовке Authorization
  headers.set('Authorization', `Bearer ${BLOB_READ_WRITE_TOKEN}`)
  headers.set('Content-Type', contentType || 'application/octet-stream')
  headers.set('x-content-type', contentType || 'application/octet-stream')
  
  if (options.upsert) {
    headers.set('x-add-random-suffix', 'false')
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body as BodyInit,
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Vercel Blob] Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url,
        tokenLength: BLOB_READ_WRITE_TOKEN.length,
        tokenPrefix: BLOB_READ_WRITE_TOKEN.substring(0, 20) + '...',
      })
      throw new Error(`Vercel Blob upload failed (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    // Vercel Blob возвращает URL в поле url
    const blobUrl = result.url || result.path || result
    if (!blobUrl || typeof blobUrl !== 'string') {
      console.error('[Vercel Blob] Unexpected response:', result)
      throw new Error('Vercel Blob did not return a URL')
    }
    console.log('[Vercel Blob] Upload successful:', blobUrl)
    return blobUrl
  } catch (error) {
    console.error('[Vercel Blob] Upload error:', error)
    throw error
  }
}

export async function supabaseDelete(path: string, searchParams: Record<string, string>) {
  return supabaseRestRequest(path, {
    method: 'DELETE',
    searchParams,
    expect: 'void',
  })
}

