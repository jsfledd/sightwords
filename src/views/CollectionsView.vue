<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="w-full bg-white border-b-4 border-teal-200 py-6 mb-8 shadow-md">
      <div class="text-center">
        <h1 class="text-5xl font-bold mb-4 text-teal-700">Sight Words</h1>
        <button
          @click="navigateToCreate"
          class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all hover:shadow-xl"
        >
          Add New Collection
        </button>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4">
      <!-- Collections List -->
      <div v-if="collectionsStore.collections.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-xl">No collections yet. Create your first collection!</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="collection in collectionsStore.collections"
          :key="collection.id"
          class="bg-white rounded-3xl shadow-lg p-3 border-2 border-teal-100"
        >
          <!-- Collection Header -->
          <div class="flex gap-4 items-center mb-3">
            <!-- Checkbox -->
            <input
              type="checkbox"
              :id="`collection-${collection.id}`"
              v-model="selectedCollections"
              :value="collection.id"
              class="w-6 h-6 text-teal-500 rounded-lg focus:ring-2 focus:ring-teal-400 flex-shrink-0"
            />

            <!-- Collection Name (Accordion Toggle) - Takes maximum space -->
            <button
              @click="toggleExpanded(collection.id)"
              class="flex-1 text-left text-xl font-bold hover:text-teal-600 transition-colors text-gray-800"
            >
              {{ collection.name }} ({{ collection.words.length }})
            </button>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-1 items-center flex-shrink-0">
              <button
                @click="navigateToEdit(collection.id)"
                class="text-teal-600 hover:text-teal-700 font-semibold px-2 py-2 rounded-full hover:bg-teal-50 transition-colors"
                title="Edit"
              >
                ⚙️
              </button>
              <button
                @click="confirmDelete(collection.id, collection.name)"
                class="text-orange-600 hover:text-orange-700 font-semibold px-2 py-2 rounded-full hover:bg-orange-50 transition-colors"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Expanded Word List -->
          <div
            v-if="expandedCollections.has(collection.id)"
            class="mt-4 pt-4 border-t-2 border-teal-100"
          >
            <div class="space-y-2">
              <div
                v-for="(word, index) in collection.words"
                :key="index"
                class="flex items-center justify-between bg-teal-50 px-4 py-3 rounded-2xl"
              >
                <span class="text-lg font-medium text-teal-900">
                  {{ word }}
                </span>
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                    getStatsBadgeColor(collection.id, word)
                  ]"
                >
                  {{ getWordAttempts(collection.id, word) }}
                </div>
              </div>
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
            'font-bold py-4 px-12 rounded-full text-xl transition-all shadow-lg',
            selectedCollections.length > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer hover:shadow-xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          Start Practice
          <span v-if="selectedCollections.length > 0" class="text-base ml-2">
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

const getWordAttempts = (collectionId: string, word: string): number => {
  const stats = collectionsStore.getWordStats(collectionId, word)
  if (!stats) return 0
  return stats.correct + stats.incorrect
}

const getStatsBadgeColor = (collectionId: string, word: string): string => {
  const stats = collectionsStore.getWordStats(collectionId, word)
  if (!stats || (stats.correct + stats.incorrect) === 0) {
    return 'bg-gray-400'
  }

  const percentage = collectionsStore.getWordPercentage(stats)

  if (percentage >= 90) {
    return 'bg-green-500'
  } else if (percentage >= 80) {
    return 'bg-yellow-500'
  } else if (percentage >= 70) {
    return 'bg-orange-500'
  } else {
    return 'bg-red-500'
  }
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
