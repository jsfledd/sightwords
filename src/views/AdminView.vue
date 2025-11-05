<template>
  <div class="min-h-screen px-4 py-8">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-4xl font-bold text-teal-700">Admin: Default Collections</h1>
        <button
          @click="goBack"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all"
        >
          Back
        </button>
      </div>
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
        <div class="flex gap-4 mb-6">
          <button
            @click="loadFromJson"
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all"
          >
            Reload from JSON
          </button>
          <button
            @click="saveToJson"
            class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all"
          >
            Save to JSON
          </button>
          <button
            @click="addNewCollection"
            class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all"
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
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-1">
                <label class="block text-sm font-semibold text-gray-600 mb-1">Collection ID</label>
                <input
                  v-model="collection.id"
                  type="text"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none"
                  placeholder="unique-id"
                />
              </div>
              <div class="flex-1">
                <label class="block text-sm font-semibold text-gray-600 mb-1">Collection Name</label>
                <input
                  v-model="collection.name"
                  type="text"
                  class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none"
                  placeholder="Collection Name"
                />
              </div>
              <button
                @click="deleteCollection(index)"
                class="mt-6 text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
                title="Delete Collection"
              >
                🗑️ Delete
              </button>
            </div>

            <!-- Words -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-2">
                Words ({{ collection.words.length }})
              </label>
              <textarea
                v-model="collection.wordsText"
                @input="updateWords(collection)"
                rows="4"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none font-mono text-sm"
                placeholder="Enter words separated by commas, spaces, or new lines"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Separate words with commas, spaces, or new lines. They will be automatically cleaned up.
              </p>
            </div>
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

interface DefaultCollection {
  id: string
  name: string
  words: string[]
  wordsText?: string // For textarea editing
}

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const defaultCollections = ref<DefaultCollection[]>([])

onMounted(() => {
  loadFromJson()
})

const loadFromJson = async () => {
  loading.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await fetch('/default-collections.json')
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`)
    }

    const data = await response.json()
    defaultCollections.value = data.map((col: DefaultCollection) => ({
      ...col,
      wordsText: col.words.join(', ')
    }))

    loading.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error occurred'
    loading.value = false
  }
}

const updateWords = (collection: DefaultCollection) => {
  if (!collection.wordsText) {
    collection.words = []
    return
  }

  // Split by commas, spaces, or new lines, then clean up
  collection.words = collection.wordsText
    .split(/[,\s\n]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0)
}

const addNewCollection = () => {
  const newId = `collection-${Date.now()}`
  defaultCollections.value.push({
    id: newId,
    name: 'New Collection',
    words: [],
    wordsText: ''
  })
}

const deleteCollection = (index: number) => {
  const collection = defaultCollections.value[index]
  if (confirm(`Are you sure you want to delete "${collection?.name}"?`)) {
    defaultCollections.value.splice(index, 1)
  }
}

const saveToJson = () => {
  // Prepare data for download
  const dataToSave = defaultCollections.value.map(col => ({
    id: col.id,
    name: col.name,
    words: col.words
  }))

  const jsonString = JSON.stringify(dataToSave, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // Create download link
  const link = document.createElement('a')
  link.href = url
  link.download = 'default-collections.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  successMessage.value = 'JSON file downloaded! Replace the file in /public/ directory.'
  setTimeout(() => {
    successMessage.value = null
  }, 5000)
}

const goBack = () => {
  router.push('/')
}
</script>
