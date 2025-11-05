import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AttemptRecord {
  timestamp: number // Unix timestamp in milliseconds
  correct: boolean
}

export interface WordStats {
  word: string
  correct: number
  incorrect: number
  attempts?: AttemptRecord[] // Historical log of attempts
}

export interface Collection {
  id: string
  name: string
  words: string[]
  stats?: WordStats[]
}

const STORAGE_KEY = 'flashcards-collections'

export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<Collection[]>([])

  // Load collections from localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        collections.value = JSON.parse(stored)
      } else {
        // Initialize with sample collection if no data exists
        collections.value = [
          {
            id: generateId(),
            name: 'Sample Words',
            words: ['we', 'see', 'my', 'he', 'she', 'with', 'said']
          }
        ]
        saveToLocalStorage()
      }
    } catch (error) {
      console.error('Error loading collections from localStorage:', error)
      collections.value = []
    }
  }

  // Save collections to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections.value))
    } catch (error) {
      console.error('Error saving collections to localStorage:', error)
    }
  }

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // Add a new collection
  const addCollection = (name: string, words: string[]) => {
    const newCollection: Collection = {
      id: generateId(),
      name: name.trim(),
      words: words.filter(word => word.trim() !== '').map(word => word.trim())
    }
    collections.value.push(newCollection)
    saveToLocalStorage()
    return newCollection.id
  }

  // Update an existing collection
  const updateCollection = (id: string, name: string, words: string[]) => {
    const index = collections.value.findIndex(c => c.id === id)
    if (index !== -1) {
      collections.value[index] = {
        id,
        name: name.trim(),
        words: words.filter(word => word.trim() !== '').map(word => word.trim())
      }
      saveToLocalStorage()
      return true
    }
    return false
  }

  // Delete a collection
  const deleteCollection = (id: string) => {
    const index = collections.value.findIndex(c => c.id === id)
    if (index !== -1) {
      collections.value.splice(index, 1)
      saveToLocalStorage()
      return true
    }
    return false
  }

  // Get collection by ID
  const getCollectionById = (id: string): Collection | undefined => {
    return collections.value.find(c => c.id === id)
  }

  // Get words from multiple collections
  const getWordsFromCollections = (collectionIds: string[]): string[] => {
    const allWords: string[] = []
    collectionIds.forEach(id => {
      const collection = getCollectionById(id)
      if (collection) {
        allWords.push(...collection.words)
      }
    })
    return allWords
  }

  // Initialize stats for a collection if they don't exist
  const initializeStats = (collectionId: string) => {
    const collection = getCollectionById(collectionId)
    if (collection && !collection.stats) {
      collection.stats = collection.words.map(word => ({
        word,
        correct: 0,
        incorrect: 0
      }))
      saveToLocalStorage()
    }
  }

  // Record a word attempt
  const recordWordAttempt = (collectionId: string, word: string, correct: boolean) => {
    const collection = getCollectionById(collectionId)
    if (!collection) return

    // Initialize stats if needed
    if (!collection.stats) {
      collection.stats = collection.words.map(w => ({
        word: w,
        correct: 0,
        incorrect: 0,
        attempts: []
      }))
    }

    // Find the word's stats
    let wordStats = collection.stats.find(s => s.word === word)
    if (!wordStats) {
      // Word not in stats yet, add it
      wordStats = { word, correct: 0, incorrect: 0, attempts: [] }
      collection.stats.push(wordStats)
    }

    // Initialize attempts array if it doesn't exist (migration support)
    if (!wordStats.attempts) {
      wordStats.attempts = []
    }

    // Create attempt record
    const attempt: AttemptRecord = {
      timestamp: Date.now(),
      correct
    }

    // Add to attempts history (keep last 20 attempts to manage storage)
    wordStats.attempts.push(attempt)
    if (wordStats.attempts.length > 20) {
      wordStats.attempts.shift() // Remove oldest
    }

    // Update the count
    if (correct) {
      wordStats.correct++
    } else {
      wordStats.incorrect++
    }

    saveToLocalStorage()
  }

  // Get stats for a specific word in a collection
  const getWordStats = (collectionId: string, word: string): WordStats | undefined => {
    const collection = getCollectionById(collectionId)
    if (!collection || !collection.stats) return undefined
    return collection.stats.find(s => s.word === word)
  }

  // Calculate percentage correct for a word
  const getWordPercentage = (stats: WordStats): number => {
    const total = stats.correct + stats.incorrect
    if (total === 0) return 0
    return Math.round((stats.correct / total) * 100)
  }

  // Get recent attempts for graphing (last N attempts)
  const getRecentAttempts = (collectionId: string, word: string, limit: number = 10): AttemptRecord[] => {
    const stats = getWordStats(collectionId, word)
    if (!stats || !stats.attempts || stats.attempts.length === 0) {
      return []
    }
    // Return last N attempts
    return stats.attempts.slice(-limit)
  }

  // Get collection-wide accuracy trend (average of all words' recent attempts)
  const getCollectionTrend = (collectionId: string, limit: number = 10): number[] => {
    const collection = getCollectionById(collectionId)
    if (!collection || !collection.stats) return []

    // Get all attempts across all words, sorted by timestamp
    const allAttempts: AttemptRecord[] = []
    collection.stats.forEach(stat => {
      if (stat.attempts) {
        allAttempts.push(...stat.attempts)
      }
    })

    if (allAttempts.length === 0) return []

    // Sort by timestamp
    allAttempts.sort((a, b) => a.timestamp - b.timestamp)

    // Take last N attempts
    const recentAttempts = allAttempts.slice(-limit)

    // Calculate rolling accuracy for each point
    const trend: number[] = []
    for (let i = 0; i < recentAttempts.length; i++) {
      const correctCount = recentAttempts.slice(0, i + 1).filter(a => a.correct).length
      const accuracy = (correctCount / (i + 1)) * 100
      trend.push(accuracy)
    }

    return trend
  }

  return {
    collections,
    loadFromLocalStorage,
    saveToLocalStorage,
    addCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    getWordsFromCollections,
    initializeStats,
    recordWordAttempt,
    getWordStats,
    getWordPercentage,
    getRecentAttempts,
    getCollectionTrend
  }
})
