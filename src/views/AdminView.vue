<template>
  <div class="min-h-screen px-4 py-8">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <h1 class="text-4xl font-bold text-teal-700 mb-4">Admin: Default Collections</h1>
      <p class="text-gray-600">
        Manage the default collections that are loaded from the JSON file.
      </p>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-xl text-gray-500">Loading default collections...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-2 border-red-200 rounded-3xl p-6 mb-6">
        <p class="text-red-700 font-semibold">Error: {{ error }}</p>
      </div>

      <!-- Collections Editor -->
      <div v-else>
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            @click="goToDataManagement"
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            📊 Manage Data
          </button>
          <button
            @click="generateShareLink"
            class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            📤 Generate Share Link
          </button>
          <button
            @click="goToInstall"
            class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            📱 Install Admin PWA
          </button>
          <button
            @click="addNewCollection"
            class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            Add Collection
          </button>
        </div>

        <!-- Collections List -->
        <div class="space-y-4">
          <div
            v-for="(collection, index) in defaultCollections"
            :key="collection.id"
            class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100"
          >
            <!-- Collection Header -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-600 mb-1">Collection Name</label>
              <input
                v-model="collection.name"
                @input="saveToLocalStorage"
                type="text"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none"
                placeholder="Collection Name"
              />
            </div>

            <!-- Words -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                Words ({{ collection.words.length }})
              </label>
              <textarea
                v-model="collection.wordsText"
                @input="updateWords(collection)"
                rows="6"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none font-mono text-sm"
                :placeholder="index === 0 ? 'CSV format: cat, dog, bird, fish, rabbit' : 'One per line:\ncat\ndog\nbird\nfish\nrabbit'"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Supports CSV format (comma-separated) or one word per line. Words are automatically cleaned up.
              </p>
            </div>

            <!-- Delete Button -->
            <button
              @click="deleteCollection(index)"
              class="w-full text-red-600 hover:text-red-700 font-semibold py-2 px-4 rounded-full hover:bg-red-50 transition-colors border-2 border-red-200"
              title="Delete Collection"
            >
              🗑️ Delete Collection
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-6 bg-green-50 border-2 border-green-200 rounded-3xl p-4">
          <p class="text-green-700 font-semibold">{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateShareUrl } from '../utils/shareCollections'

interface DefaultCollection {
  id: string
  name: string
  words: string[]
  wordsText?: string // For textarea editing
}

const ADMIN_STORAGE_KEY = 'flashcards-admin-collections'

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const defaultCollections = ref<DefaultCollection[]>([])

onMounted(() => {
  loadFromLocalStorage()
})

const loadFromLocalStorage = () => {
  loading.value = true
  error.value = null
  successMessage.value = null

  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (stored) {
      // Load from localStorage
      const data = JSON.parse(stored)
      defaultCollections.value = data.map((col: DefaultCollection) => ({
        ...col,
        wordsText: col.words.join(', ')
      }))
    } else {
      // First time: load from JSON file
      loadFromJson()
      return
    }
    loading.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error loading from localStorage'
    loading.value = false
  }
}

const saveToLocalStorage = () => {
  try {
    const dataToSave = defaultCollections.value.map(col => ({
      id: col.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: col.name,
      words: col.words
    }))
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (e) {
    console.error('Error saving to localStorage:', e)
  }
}

const loadFromJson = async () => {
  loading.value = true
  error.value = null
  successMessage.value = null

  try {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const response = await fetch(`${baseUrl}default-collections.json`)
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`)
    }

    const data = await response.json()
    defaultCollections.value = data.map((col: DefaultCollection) => ({
      ...col,
      wordsText: col.words.join(', ')
    }))

    // Save to localStorage for future loads
    saveToLocalStorage()
    loading.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error occurred'
    loading.value = false
  }
}

const updateWords = (collection: DefaultCollection) => {
  if (!collection.wordsText) {
    collection.words = []
    saveToLocalStorage()
    return
  }

  // Split by commas, spaces, or new lines, then clean up
  collection.words = collection.wordsText
    .split(/[,\s\n]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0)

  // Save to localStorage whenever words are updated
  saveToLocalStorage()
}

const addNewCollection = () => {
  const newId = `collection-${Date.now()}`
  defaultCollections.value.push({
    id: newId,
    name: 'New Collection',
    words: [],
    wordsText: ''
  })
  saveToLocalStorage()
}

const deleteCollection = (index: number) => {
  const collection = defaultCollections.value[index]
  if (confirm(`Are you sure you want to delete "${collection?.name}"?`)) {
    defaultCollections.value.splice(index, 1)
    saveToLocalStorage()
  }
}

const generateShareLink = () => {
  // Prepare collections data for sharing
  const collectionsToShare = defaultCollections.value.map(col => ({
    name: col.name,
    words: col.words
  }))

  // Generate the share URL
  const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '/')
  const shareUrl = generateShareUrl(collectionsToShare, baseUrl)

  // Copy to clipboard
  navigator.clipboard.writeText(shareUrl).then(() => {
    successMessage.value = 'Share link copied to clipboard!'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  }).catch(() => {
    // Fallback: show the URL in a prompt
    prompt('Copy this share link:', shareUrl)
  })
}

const goToInstall = () => {
  router.push('/install-admin')
}

const goToDataManagement = () => {
  router.push('/admin/data')
}
</script>
