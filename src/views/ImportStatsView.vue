<template>
  <div class="min-h-screen px-4 py-8">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <h1 class="text-4xl font-bold text-teal-700 mb-4">Import Progress Data</h1>
      <p class="text-gray-600">Review and import practice session stats from another user.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto text-center py-12">
      <p class="text-xl text-gray-500">Loading stats data...</p>
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

    <!-- Stats Preview -->
    <div v-else class="max-w-4xl mx-auto">
      <div class="space-y-4 mb-6">
        <div
          v-for="(collection, index) in statsData"
          :key="index"
          class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100"
        >
          <div class="flex items-start gap-4">
            <!-- Status Icon -->
            <div class="text-3xl flex-shrink-0">
              {{ getStatusIcon(collection) }}
            </div>

            <div class="flex-1">
              <!-- Collection Name -->
              <h2 class="text-xl font-bold text-gray-800 mb-2">
                {{ collection.name }}
              </h2>

              <!-- Status Message -->
              <p class="text-sm mb-3" :class="getStatusClass(collection)">
                {{ getStatusMessage(collection) }}
              </p>

              <!-- Stats Summary -->
              <div v-if="collection.stats.length > 0" class="text-sm text-gray-600">
                <p class="mb-1">
                  <strong>{{ collection.stats.length }}</strong> words with stats
                </p>
                <p>
                  <strong>{{ getTotalSessions(collection.stats) }}</strong> total practice sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Strategy Selector -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100 mb-6">
        <h2 class="text-2xl font-bold text-teal-700 mb-4">Import Strategy</h2>
        <div class="space-y-3">
          <label class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              v-model="importStrategy"
              value="merge"
              class="w-5 h-5 mt-1 text-teal-500"
            />
            <div>
              <div class="font-semibold text-gray-800">Merge (Recommended)</div>
              <div class="text-sm text-gray-600">Add new stats to existing data, keeping all progress</div>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="radio"
              v-model="importStrategy"
              value="replace"
              class="w-5 h-5 mt-1 text-teal-500"
            />
            <div>
              <div class="font-semibold text-gray-800">Replace</div>
              <div class="text-sm text-gray-600">Overwrite existing stats with imported data</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 sticky bottom-4">
        <button
          @click="importStats"
          class="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg transition-all text-lg"
        >
          Import Stats Data
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCollectionsStore } from '../stores/collections'
import { decodeImportData, type StatsExport } from '../utils/dataManagement'
import type { WordStats } from '../stores/collections'

interface StatsCollection {
  id: string
  name: string
  stats: WordStats[]
  exists: boolean
}

const router = useRouter()
const route = useRoute()
const collectionsStore = useCollectionsStore()

const statsData = ref<StatsCollection[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const importStrategy = ref<'merge' | 'replace'>('merge')

onMounted(async () => {
  try {
    // Ensure collections store is loaded first
    await collectionsStore.loadFromLocalStorage()

    const dataParam = route.query.data as string
    if (!dataParam) {
      error.value = 'No stats data found in URL'
      loading.value = false
      return
    }

    // Decode and validate the data
    const result = decodeImportData(dataParam)
    if (result.error || !result.data) {
      error.value = result.error || 'Failed to parse stats data'
      loading.value = false
      return
    }

    // Validate it's stats data
    if (result.data.type !== 'stats') {
      error.value = 'Invalid data type. Expected stats data, but got collections data.'
      loading.value = false
      return
    }

    const statsExport = result.data as StatsExport

    // Map stats to collections and check if they exist
    statsData.value = statsExport.collections.map(col => {
      const existingCollection = collectionsStore.getCollectionById(col.id) ||
        collectionsStore.collections.find(c => c.name.toLowerCase() === col.name.toLowerCase())

      return {
        id: col.id,
        name: col.name,
        stats: col.stats,
        exists: !!existingCollection
      }
    })

    loading.value = false
  } catch (e) {
    error.value = 'Failed to parse stats data. Please check the URL.'
    loading.value = false
  }
})

const getStatusIcon = (collection: StatsCollection): string => {
  return collection.exists ? '✅' : '⚠️'
}

const getStatusClass = (collection: StatsCollection): string => {
  return collection.exists ? 'text-green-700' : 'text-orange-700'
}

const getStatusMessage = (collection: StatsCollection): string => {
  return collection.exists
    ? 'Collection found - stats will be imported'
    : 'Collection not found - stats will be skipped'
}

const getTotalSessions = (stats: WordStats[]): number => {
  return stats.reduce((total, stat) => total + (stat.sessions?.length || 0), 0)
}

const importStats = async () => {
  const validCollections = statsData.value.filter(c => c.exists)

  if (validCollections.length === 0) {
    alert('No matching collections found. Please add the collections first, then import stats.')
    return
  }

  const skippedCount = statsData.value.length - validCollections.length
  if (skippedCount > 0) {
    const proceed = confirm(
      `${skippedCount} collection(s) will be skipped because they don't exist.\n\n` +
      `${validCollections.length} collection(s) will have stats imported.\n\n` +
      `Continue with import?`
    )
    if (!proceed) return
  }

  // Import stats for each valid collection
  for (const col of validCollections) {
    const existingCollection = collectionsStore.getCollectionById(col.id) ||
      collectionsStore.collections.find(c => c.name.toLowerCase() === col.name.toLowerCase())

    if (!existingCollection) continue

    if (importStrategy.value === 'replace') {
      // Replace: overwrite existing stats
      existingCollection.stats = col.stats
    } else {
      // Merge: combine stats intelligently
      if (!existingCollection.stats) {
        existingCollection.stats = []
      }

      col.stats.forEach(importedStat => {
        const existingStatIndex = existingCollection.stats!.findIndex(s => s.word === importedStat.word)

        if (existingStatIndex >= 0) {
          // Merge stats for this word
          const existingStat = existingCollection.stats![existingStatIndex]!

          if (importStrategy.value === 'merge') {
            // Add to existing counts
            existingStat.correct += importedStat.correct
            existingStat.incorrect += importedStat.incorrect

            // Merge sessions (keep both)
            if (!existingStat.sessions) existingStat.sessions = []
            if (importedStat.sessions) {
              existingStat.sessions.push(...importedStat.sessions)
              // Keep last 25 sessions
              if (existingStat.sessions.length > 25) {
                existingStat.sessions = existingStat.sessions.slice(-25)
              }
            }
          }
        } else {
          // Add new stat for word not previously tracked
          existingCollection.stats!.push(importedStat)
        }
      })
    }
  }

  // Save all changes
  collectionsStore.saveToLocalStorage()

  alert(`Successfully imported stats for ${validCollections.length} collection(s)!`)
  router.push('/')
}

const goToHome = () => {
  router.push('/')
}
</script>
