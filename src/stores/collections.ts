import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Collection {
  id: string
  name: string
  words: string[]
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

  return {
    collections,
    loadFromLocalStorage,
    saveToLocalStorage,
    addCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    getWordsFromCollections
  }
})
