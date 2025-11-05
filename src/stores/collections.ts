import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SessionRecord {
  correct: number
  attempted: number
}

export interface WordStats {
  word: string
  correct: number
  incorrect: number
  sessions?: SessionRecord[] // Queue of recent practice sessions (max 10)
}

export interface Collection {
  id: string
  name: string
  words: string[]
  stats?: WordStats[]
}

const STORAGE_KEY = 'flashcards-collections'
const DEFAULTS_LOADED_KEY = 'flashcards-defaults-loaded'

export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<Collection[]>([])

  // Load default collections from JSON
  const loadDefaultCollections = async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/'
      const response = await fetch(`${baseUrl}default-collections.json`)
      if (!response.ok) {
        throw new Error('Failed to load default collections')
      }
      const defaultCollections = await response.json()

      // Add default collections to the store
      defaultCollections.forEach((col: { id: string; name: string; words: string[] }) => {
        // Check if collection already exists
        const exists = collections.value.find(c => c.id === col.id)
        if (!exists) {
          collections.value.push({
            id: col.id,
            name: col.name,
            words: col.words
          })
        }
      })

      // Mark that defaults have been loaded
      localStorage.setItem(DEFAULTS_LOADED_KEY, 'true')
      saveToLocalStorage()
    } catch (error) {
      console.error('Error loading default collections:', error)
    }
  }

  // Load collections from localStorage
  const loadFromLocalStorage = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const defaultsLoaded = localStorage.getItem(DEFAULTS_LOADED_KEY)

      if (stored) {
        collections.value = JSON.parse(stored)
      } else {
        collections.value = []
      }

      // Load defaults on first initialization
      if (!defaultsLoaded) {
        await loadDefaultCollections()
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

  // Record a word attempt (legacy - still updates totals)
  const recordWordAttempt = (collectionId: string, word: string, correct: boolean) => {
    const collection = getCollectionById(collectionId)
    if (!collection) return

    // Initialize stats if needed
    if (!collection.stats) {
      collection.stats = collection.words.map(w => ({
        word: w,
        correct: 0,
        incorrect: 0,
        sessions: []
      }))
    }

    // Find the word's stats
    let wordStats = collection.stats.find(s => s.word === word)
    if (!wordStats) {
      // Word not in stats yet, add it
      wordStats = { word, correct: 0, incorrect: 0, sessions: [] }
      collection.stats.push(wordStats)
    }

    // Update the count
    if (correct) {
      wordStats.correct++
    } else {
      wordStats.incorrect++
    }

    saveToLocalStorage()
  }

  // Record session results for a word
  const recordWordSession = (collectionId: string, word: string, correct: number, attempted: number) => {
    const collection = getCollectionById(collectionId)
    if (!collection) return

    // Initialize stats if needed
    if (!collection.stats) {
      collection.stats = collection.words.map(w => ({
        word: w,
        correct: 0,
        incorrect: 0,
        sessions: []
      }))
    }

    // Find the word's stats
    let wordStats = collection.stats.find(s => s.word === word)
    if (!wordStats) {
      // Word not in stats yet, add it
      wordStats = { word, correct: 0, incorrect: 0, sessions: [] }
      collection.stats.push(wordStats)
    }

    // Initialize sessions array if it doesn't exist (migration support)
    if (!wordStats.sessions) {
      wordStats.sessions = []
    }

    // Create session record
    const session: SessionRecord = {
      correct,
      attempted
    }

    // Add to session queue (keep last 10 sessions)
    wordStats.sessions.push(session)
    if (wordStats.sessions.length > 10) {
      wordStats.sessions.shift() // Remove oldest
    }

    // Update aggregate counts
    wordStats.correct += correct
    wordStats.incorrect += (attempted - correct)

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

  // Get recent sessions for graphing (last N sessions)
  const getRecentSessions = (collectionId: string, word: string, limit: number = 10): SessionRecord[] => {
    const stats = getWordStats(collectionId, word)
    if (!stats || !stats.sessions || stats.sessions.length === 0) {
      return []
    }
    // Return last N sessions
    return stats.sessions.slice(-limit)
  }

  // Get collection-wide session data (aggregate sessions by index across all words)
  const getCollectionSessions = (collectionId: string, limit: number = 10): SessionRecord[] => {
    const collection = getCollectionById(collectionId)
    if (!collection || !collection.stats) return []

    // Find the maximum number of sessions any word has
    let maxSessions = 0
    collection.stats.forEach(stat => {
      if (stat.sessions && stat.sessions.length > maxSessions) {
        maxSessions = stat.sessions.length
      }
    })

    if (maxSessions === 0) return []

    // Aggregate sessions by index (session 0, 1, 2, etc.)
    const aggregatedSessions: SessionRecord[] = []

    for (let i = 0; i < maxSessions; i++) {
      let totalCorrect = 0
      let totalAttempted = 0

      collection.stats.forEach(stat => {
        if (stat.sessions && stat.sessions[i]) {
          const session = stat.sessions[i]
          if (session) {
            totalCorrect += session.correct
            totalAttempted += session.attempted
          }
        }
      })

      aggregatedSessions.push({
        correct: totalCorrect,
        attempted: totalAttempted
      })
    }

    // Return last N sessions
    return aggregatedSessions.slice(-limit)
  }

  return {
    collections,
    loadFromLocalStorage,
    loadDefaultCollections,
    saveToLocalStorage,
    addCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    getWordsFromCollections,
    initializeStats,
    recordWordAttempt,
    recordWordSession,
    getWordStats,
    getWordPercentage,
    getRecentSessions,
    getCollectionSessions
  }
})
