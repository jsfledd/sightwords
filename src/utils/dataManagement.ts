import type { Collection, WordStats } from '../stores/collections'

// Export data format versions
export const DATA_VERSION = '1.0'

// Stats-only export (lightweight for sharing progress)
export interface StatsExport {
  version: string
  type: 'stats'
  exportDate: string
  collections: {
    id: string
    name: string
    stats: WordStats[]
  }[]
}

// Full collection export (complete backup/migration)
export interface CollectionExport {
  version: string
  type: 'collections'
  exportDate: string
  collections: Collection[]
}

// Union type for all export formats
export type ExportData = StatsExport | CollectionExport

// Export stats only (for sharing progress)
export function exportStats(collections: Collection[]): StatsExport {
  return {
    version: DATA_VERSION,
    type: 'stats',
    exportDate: new Date().toISOString(),
    collections: collections.map(col => ({
      id: col.id,
      name: col.name,
      stats: col.stats || []
    }))
  }
}

// Export full collections (for backup/migration)
export function exportCollections(collections: Collection[]): CollectionExport {
  return {
    version: DATA_VERSION,
    type: 'collections',
    exportDate: new Date().toISOString(),
    collections: collections
  }
}

// Generate share URL with base64 encoded data
export function generateShareUrl(data: ExportData, baseUrl: string): string {
  const jsonData = JSON.stringify(data)
  const encodedData = btoa(jsonData)
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  const routePath = data.type === 'stats' ? '/importStats' : '/importCollections'
  return `${cleanBaseUrl}/#${routePath}?data=${encodedData}`
}

// Validate import data structure
export function validateImportData(data: unknown): { valid: boolean; error?: string; type?: 'stats' | 'collections' } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' }
  }

  const obj = data as Record<string, unknown>

  // Check version
  if (!obj.version || typeof obj.version !== 'string') {
    return { valid: false, error: 'Missing or invalid version' }
  }

  // Check type
  if (!obj.type || (obj.type !== 'stats' && obj.type !== 'collections')) {
    return { valid: false, error: 'Invalid data type (must be "stats" or "collections")' }
  }

  // Check collections array
  if (!Array.isArray(obj.collections) || obj.collections.length === 0) {
    return { valid: false, error: 'Missing or empty collections array' }
  }

  // Validate based on type
  if (obj.type === 'stats') {
    // Validate stats export format
    for (const col of obj.collections) {
      const c = col as Record<string, unknown>
      if (!c.id || !c.name || !Array.isArray(c.stats)) {
        return { valid: false, error: 'Invalid stats collection format' }
      }
    }
  } else {
    // Validate full collection export format
    for (const col of obj.collections) {
      const c = col as Record<string, unknown>
      if (!c.id || !c.name || !Array.isArray(c.words)) {
        return { valid: false, error: 'Invalid collection format' }
      }
    }
  }

  return { valid: true, type: obj.type as 'stats' | 'collections' }
}

// Decode base64 data and validate
export function decodeImportData(encodedData: string): { data?: ExportData; error?: string } {
  try {
    const decodedData = atob(encodedData)
    const parsedData = JSON.parse(decodedData)

    const validation = validateImportData(parsedData)
    if (!validation.valid) {
      return { error: validation.error }
    }

    return { data: parsedData as ExportData }
  } catch (error) {
    return { error: 'Failed to decode or parse data' }
  }
}

// Generate JSON string for download/copy
export function generateJsonString(data: ExportData, pretty: boolean = true): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
}

// Create downloadable file
export function downloadJsonFile(data: ExportData, filename: string) {
  const jsonString = generateJsonString(data, true)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (fallbackError) {
      return false
    }
  }
}
