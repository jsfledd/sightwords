<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-4">Sight Word Collections</h1>
        <button
          @click="navigateToCreate"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Add New Collection
        </button>
      </div>

      <!-- Collections List -->
      <div v-if="collectionsStore.collections.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-xl">No collections yet. Create your first collection!</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="collection in collectionsStore.collections"
          :key="collection.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <!-- Collection Header -->
          <div class="flex items-center gap-4 mb-3">
            <!-- Checkbox -->
            <input
              type="checkbox"
              :id="`collection-${collection.id}`"
              v-model="selectedCollections"
              :value="collection.id"
              class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />

            <!-- Collection Name (Accordion Toggle) -->
            <button
              @click="toggleExpanded(collection.id)"
              class="flex-1 text-left text-xl font-semibold hover:text-blue-600 transition-colors"
            >
              {{ collection.name }}
              <span class="text-sm text-gray-500 ml-2">({{ collection.words.length }} words)</span>
            </button>

            <!-- Action Buttons -->
            <button
              @click="navigateToEdit(collection.id)"
              class="text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(collection.id, collection.name)"
              class="text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>

          <!-- Expanded Word List -->
          <div
            v-if="expandedCollections.has(collection.id)"
            class="mt-4 pt-4 border-t border-gray-200"
          >
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(word, index) in collection.words"
                :key="index"
                class="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {{ word }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Practice Button -->
      <div v-if="collectionsStore.collections.length > 0" class="mt-8 text-center">
        <button
          @click="startPractice"
          :disabled="selectedCollections.length === 0"
          :class="[
            'font-semibold py-3 px-8 rounded-lg text-lg transition-all',
            selectedCollections.length > 0
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          Start Practice
          <span v-if="selectedCollections.length > 0" class="text-sm ml-2">
            ({{ getTotalWords() }} words)
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCollectionsStore } from '../stores/collections'

const router = useRouter()
const collectionsStore = useCollectionsStore()

const selectedCollections = ref<string[]>([])
const expandedCollections = ref<Set<string>>(new Set())

// Load collections on mount
collectionsStore.loadFromLocalStorage()

const navigateToCreate = () => {
  router.push('/collection/new')
}

const navigateToEdit = (id: string) => {
  router.push(`/collection/${id}/edit`)
}

const toggleExpanded = (id: string) => {
  if (expandedCollections.value.has(id)) {
    expandedCollections.value.delete(id)
  } else {
    expandedCollections.value.add(id)
  }
}

const confirmDelete = (id: string, name: string) => {
  if (confirm(`Are you sure you want to delete the collection "${name}"?`)) {
    collectionsStore.deleteCollection(id)
    // Remove from selected if it was selected
    selectedCollections.value = selectedCollections.value.filter(cId => cId !== id)
    // Remove from expanded if it was expanded
    expandedCollections.value.delete(id)
  }
}

const getTotalWords = (): number => {
  return collectionsStore.getWordsFromCollections(selectedCollections.value).length
}

const startPractice = () => {
  if (selectedCollections.value.length > 0) {
    router.push({
      name: 'practice',
      query: { collections: selectedCollections.value.join(',') }
    })
  }
}
</script>
