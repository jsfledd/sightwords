<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="text-teal-600 hover:text-teal-700 font-semibold mb-4 inline-flex items-center px-4 py-2 rounded-full hover:bg-teal-50 transition-colors"
        >
          <span class="mr-2 text-xl">←</span> Back to Collections
        </button>
        <h1 class="text-4xl font-bold text-teal-700">
          {{ isEditMode ? 'Edit Collection' : 'Create New Collection' }}
        </h1>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-teal-100">
        <!-- Collection Name -->
        <div class="mb-6">
          <label for="collection-name" class="block text-base font-bold mb-2 text-gray-700">
            Collection Name
          </label>
          <input
            id="collection-name"
            v-model="collectionName"
            type="text"
            placeholder="e.g., First Grade Words"
            class="w-full px-5 py-3 border-2 border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white text-lg"
            @keyup.enter="focusWordsTextarea"
          />
          <p v-if="errors.name" class="text-orange-600 text-sm mt-1 font-medium">{{ errors.name }}</p>
        </div>

        <!-- Words Input -->
        <div class="mb-6">
          <label for="words-input" class="block text-base font-bold mb-2 text-gray-700">
            Sight Words (one per line)
          </label>
          <textarea
            id="words-input"
            ref="wordsTextarea"
            v-model="wordsText"
            rows="15"
            placeholder="Enter sight words, one per line&#10;&#10;Example:&#10;we&#10;see&#10;my&#10;he"
            class="w-full px-5 py-3 border-2 border-teal-200 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 font-mono bg-white text-lg"
          ></textarea>
          <p v-if="errors.words" class="text-orange-600 text-sm mt-1 font-medium">{{ errors.words }}</p>
          <p class="text-gray-600 text-sm mt-2 font-medium">
            {{ wordCount }} word{{ wordCount !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            @click="saveCollection"
            class="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            {{ isEditMode ? 'Save Changes' : 'Create Collection' }}
          </button>
          <button
            @click="goBack"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 rounded-full transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCollectionsStore } from '../stores/collections'

const router = useRouter()
const route = useRoute()
const collectionsStore = useCollectionsStore()

const collectionName = ref('')
const wordsText = ref('')
const wordsTextarea = ref<HTMLTextAreaElement | null>(null)
const errors = ref<{ name?: string; words?: string }>({})

const isEditMode = computed(() => !!route.params.id)
const collectionId = computed(() => route.params.id as string)

const wordCount = computed(() => {
  return parseWords().length
})

onMounted(() => {
  // Load existing collection data if in edit mode
  if (isEditMode.value) {
    const collection = collectionsStore.getCollectionById(collectionId.value)
    if (collection) {
      collectionName.value = collection.name
      wordsText.value = collection.words.join('\n')
    } else {
      // Collection not found, redirect to home
      router.push('/')
    }
  }
})

const parseWords = (): string[] => {
  return wordsText.value
    .split('\n')
    .map(word => word.trim())
    .filter(word => word !== '')
}

const validate = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!collectionName.value.trim()) {
    errors.value.name = 'Collection name is required'
    isValid = false
  }

  const words = parseWords()
  if (words.length === 0) {
    errors.value.words = 'Please enter at least one word'
    isValid = false
  }

  return isValid
}

const saveCollection = () => {
  if (!validate()) {
    return
  }

  const words = parseWords()

  if (isEditMode.value) {
    // Update existing collection
    collectionsStore.updateCollection(collectionId.value, collectionName.value, words)
  } else {
    // Create new collection
    collectionsStore.addCollection(collectionName.value, words)
  }

  // Navigate back to collections list
  router.push('/')
}

const goBack = () => {
  router.push('/')
}

const focusWordsTextarea = () => {
  wordsTextarea.value?.focus()
}
</script>
