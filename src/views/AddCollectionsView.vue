<template>
  <div class="min-h-screen px-4 py-8">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <h1 class="text-4xl font-bold text-teal-700 mb-4">Add Collections</h1>
      <p class="text-gray-600">Select which collections you'd like to add to your Sight Words app.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto text-center py-12">
      <p class="text-xl text-gray-500">Loading collections...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto">
      <div class="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
        <p class="text-red-700 font-semibold mb-4">{{ error }}</p>
        <button
          @click="goToHome"
          class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
        >
          Go to Sight Words
        </button>
      </div>
    </div>

    <!-- Collections List -->
    <div v-else class="max-w-4xl mx-auto">
      <div class="space-y-4 mb-6">
        <div
          v-for="(collection, index) in collections"
          :key="index"
          class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100"
        >
          <div class="flex items-start gap-4">
            <!-- Checkbox -->
            <input
              type="checkbox"
              :id="`collection-${index}`"
              v-model="collection.selected"
              class="w-6 h-6 mt-1 text-teal-500 rounded-lg focus:ring-2 focus:ring-teal-400 flex-shrink-0"
            />

            <div class="flex-1">
              <!-- Collection Name -->
              <label
                :for="`collection-${index}`"
                class="block text-xl font-bold text-gray-800 mb-2 cursor-pointer"
              >
                {{ collection.name }}
              </label>

              <!-- Words Preview -->
              <div class="text-sm text-gray-600 mb-2">
                {{ collection.words.length }} words
              </div>

              <!-- Words List -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(word, wordIndex) in collection.words"
                  :key="wordIndex"
                  class="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                >
                  {{ word }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 sticky bottom-4">
        <button
          @click="addCollections"
          :disabled="!hasSelectedCollections"
          class="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-full shadow-lg transition-all text-lg"
        >
          Add to Sight Words
        </button>
        <button
          @click="goToHome"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCollectionsStore } from '../stores/collections'

interface ImportCollection {
  name: string
  words: string[]
  selected: boolean
}

const router = useRouter()
const route = useRoute()
const collectionsStore = useCollectionsStore()

const collections = ref<ImportCollection[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const hasSelectedCollections = computed(() => {
  return collections.value.some(c => c.selected)
})

onMounted(async () => {
  try {
    // Ensure collections store is loaded first
    await collectionsStore.loadFromLocalStorage()

    const collectionsParam = route.query.collections as string
    if (!collectionsParam) {
      error.value = 'No collections data found in URL'
      loading.value = false
      return
    }

    // Decode the collections data from base64
    const decodedData = atob(collectionsParam)
    const parsedCollections = JSON.parse(decodedData)

    if (!Array.isArray(parsedCollections)) {
      error.value = 'Invalid collections data format'
      loading.value = false
      return
    }

    // Validate and set collections
    collections.value = parsedCollections.map((col: any) => ({
      name: col.name || 'Untitled',
      words: Array.isArray(col.words) ? col.words : [],
      selected: true // Default to checked
    }))

    loading.value = false
  } catch (e) {
    error.value = 'Failed to parse collections data. Please check the URL.'
    loading.value = false
  }
})

const addCollections = async () => {
  const selectedCollections = collections.value.filter(c => c.selected)

  for (const collection of selectedCollections) {
    // Check if collection with same name exists
    const existingCollection = collectionsStore.collections.find(
      c => c.name.toLowerCase() === collection.name.toLowerCase()
    )

    if (existingCollection) {
      // Ask user if they want to overwrite
      const shouldOverwrite = confirm(
        `A collection named "${collection.name}" already exists. Do you want to overwrite it?`
      )

      if (shouldOverwrite) {
        // Delete the existing collection
        collectionsStore.deleteCollection(existingCollection.id)
        // Add the new collection
        collectionsStore.addCollection(collection.name, collection.words)
      }
      // If they don't want to overwrite, skip this collection
    } else {
      // Add the new collection
      collectionsStore.addCollection(collection.name, collection.words)
    }
  }

  // Navigate to home
  router.push('/')
}

const goToHome = () => {
  router.push('/')
}
</script>
