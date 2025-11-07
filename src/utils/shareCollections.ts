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

  // Create the URL
  const url = new URL('/addCollections', baseUrl)
  url.searchParams.set('collections', encodedData)

  return url.toString()
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
