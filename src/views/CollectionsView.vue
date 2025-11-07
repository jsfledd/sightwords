<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="w-full bg-white border-b-4 border-teal-200 py-6 mb-8 shadow-md">
      <div class="max-w-4xl mx-auto px-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-5xl font-bold text-teal-700">Sight Words</h1>
          <button
            @click="navigateToSettings"
            class="text-gray-600 hover:text-teal-600 transition-colors p-2"
            title="Settings"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div class="text-center">
          <button
            @click="navigateToCreate"
            class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all hover:shadow-xl"
          >
            Add New Collection
          </button>
        </div>
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

            <!-- Collection Name (Accordion Toggle) - Maximized Width -->
            <button
              @click="toggleExpanded(collection.id)"
              class="flex-1 text-left text-xl font-bold hover:text-teal-600 transition-colors text-gray-800"
            >
              {{ collection.name }} ({{ collection.words.length }})
            </button>

            <!-- Last Practice Result Indicator -->
            <div
              v-if="getLastSessionColor(collection.id)"
              :style="{ backgroundColor: getLastSessionColor(collection.id) || undefined }"
              class="w-1.5 self-stretch rounded-full flex-shrink-0"
            ></div>

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

          <!-- Expanded View -->
          <div
            v-if="expandedCollections.has(collection.id)"
            class="mt-4 pt-4 border-t-2 border-teal-100"
          >
            <!-- Collection-level Progress Graph -->
            <div class="mb-4 flex items-center justify-center">
              <SparklineGraph
                :sessions="collectionsStore.getCollectionSessions(collection.id)"
                :width="200"
                :height="50"
                :show-min-sessions="1"
              />
            </div>

            <!-- Word List -->
            <div class="space-y-2">
              <div
                v-for="(word, index) in collection.words"
                :key="index"
                class="flex items-center justify-between bg-teal-50 px-4 py-3 rounded-2xl"
              >
                <span class="text-lg font-medium text-teal-900">
                  {{ word }}
                </span>
                <!-- Sparkline Graph -->
                <SparklineGraph
                  :sessions="collectionsStore.getRecentSessions(collection.id, word)"
                  :width="80"
                  :height="24"
                  :show-min-sessions="1"
                />
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
import SparklineGraph from '../components/SparklineGraph.vue'

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

const navigateToSettings = () => {
  router.push('/settings')
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

const getLastSessionColor = (collectionId: string): string | null => {
  const sessions = collectionsStore.getCollectionSessions(collectionId)
  if (sessions.length === 0) return null

  // Get the last (most recent) session
  const lastSession = sessions[sessions.length - 1]
  if (!lastSession || lastSession.attempted === 0) return null

  // Calculate accuracy
  const accuracy = (lastSession.correct / lastSession.attempted) * 100

  // Return color based on accuracy (matching SparklineGraph logic)
  if (accuracy >= 90) {
    return '#10b981' // green-500
  } else if (accuracy >= 70) {
    return '#84cc16' // lime-500
  } else if (accuracy >= 50) {
    return '#eab308' // yellow-500
  } else if (accuracy >= 30) {
    return '#f97316' // orange-500
  } else {
    return '#ef4444' // red-500
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
