/**
 * Utility functions for sharing collections via URL
 */

export interface ShareableCollection {
  name: string
  words: string[]
}

/**
 * Generate a shareable URL for collections
 * @param collections Array of collections to share
 * @param baseUrl Base URL of the application (e.g., 'https://jfledd.github.io/sightwords')
 * @returns Complete shareable URL
 */
export function generateShareUrl(collections: ShareableCollection[], baseUrl: string): string {
  // Convert collections to JSON
  const jsonData = JSON.stringify(collections)

  // Encode to base64
  const encodedData = btoa(jsonData)

  // Create the URL with hash routing for SPA
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const shareUrl = `${cleanBaseUrl}/#/addCollections?collections=${encodedData}`

  return shareUrl
}

/**
 * Example usage:
 *
 * const collections = [
 *   { name: "List 1", words: ["the", "and", "is"] },
 *   { name: "List 2", words: ["a", "I", "see"] }
 * ]
 *
 * const shareUrl = generateShareUrl(collections, 'https://jfledd.github.io/sightwords')
 * // Returns: https://jfledd.github.io/sightwords/addCollections?collections=W3sibmFtZSI6Ikxpc3QgMSIsIndvcmRzIjpbInRoZSIsImFuZCIsImlzIl19LHsibmFtZSI6Ikxpc3QgMiIsIndvcmRzIjpbImEiLCJJIiwic2VlIl19XQ==
 */
