<template>
  <div class="min-h-screen px-4 py-8">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-4xl font-bold text-teal-700">Data Management</h1>
        <button
          @click="goBack"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all"
        >
          Back to Admin
        </button>
      </div>
      <p class="text-gray-600">Export, import, and manage your collections and progress data.</p>
    </div>

    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Collection Selection -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100">
        <h2 class="text-2xl font-bold text-teal-700 mb-4">Select Collections</h2>

        <div class="flex gap-3 mb-4">
          <button
            @click="selectAll"
            class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-full shadow transition-all"
          >
            Select All
          </button>
          <button
            @click="deselectAll"
            class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full shadow transition-all"
          >
            Deselect All
          </button>
        </div>

        <div v-if="collectionsStore.collections.length === 0" class="text-center py-8 text-gray-500">
          <p>No collections found.</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <label
            v-for="collection in sortedCollections"
            :key="collection.id"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <input
              type="checkbox"
              v-model="selectedCollections"
              :value="collection.id"
              class="w-5 h-5 text-teal-500 rounded"
            />
            <div class="flex-1">
              <span class="font-semibold text-gray-800">{{ collection.name }}</span>
              <span class="text-sm text-gray-600 ml-2">
                ({{ collection.words.length }} words,
                {{ getSessionCount(collection) }} sessions)
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- Export Section -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100">
        <h2 class="text-2xl font-bold text-teal-700 mb-4">Export Data</h2>

        <div class="space-y-4">
          <!-- Export Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Export Type</label>
            <div class="space-y-2">
              <label class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="radio"
                  v-model="exportType"
                  value="stats"
                  class="w-5 h-5 mt-1 text-teal-500"
                />
                <div>
                  <div class="font-semibold text-gray-800">Stats Only (Recommended for Sharing)</div>
                  <div class="text-sm text-gray-600">Export practice session stats only - lightweight for sharing progress</div>
                </div>
              </label>

              <label class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="radio"
                  v-model="exportType"
                  value="collections"
                  class="w-5 h-5 mt-1 text-teal-500"
                />
                <div>
                  <div class="font-semibold text-gray-800">Full Collections (Backup/Migration)</div>
                  <div class="text-sm text-gray-600">Export complete collections with words and stats - for backup or moving devices</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Export Buttons -->
          <div class="flex flex-wrap gap-3">
            <button
              @click="generateShareLink"
              :disabled="selectedCollections.length === 0"
              class="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              📤 Generate Share Link
            </button>
            <button
              @click="copyJsonToClipboard"
              :disabled="selectedCollections.length === 0"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              📋 Copy JSON
            </button>
            <button
              @click="downloadJson"
              :disabled="selectedCollections.length === 0"
              class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              💾 Download File
            </button>
          </div>

          <!-- Export Preview -->
          <div v-if="exportPreview" class="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p class="text-green-700 font-semibold mb-2">{{ exportMessage }}</p>
            <div v-if="shareUrl" class="mt-2">
              <p class="text-sm font-semibold text-gray-700 mb-1">Share URL:</p>
              <div class="flex gap-2">
                <input
                  type="text"
                  :value="shareUrl"
                  readonly
                  class="flex-1 px-3 py-2 bg-white border-2 border-green-300 rounded-lg text-sm"
                />
                <button
                  @click="copyShareUrl"
                  class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Section -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100">
        <h2 class="text-2xl font-bold text-teal-700 mb-4">Import Data</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Paste Base64 Data or JSON
            </label>
            <textarea
              v-model="importData"
              rows="6"
              placeholder="Paste exported data here (base64 or JSON)"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all font-mono text-sm"
            ></textarea>
          </div>

          <button
            @click="validateAndImport"
            :disabled="!importData.trim()"
            class="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            Validate & Import
          </button>

          <div v-if="importMessage" class="p-4 rounded-xl border-2" :class="importMessageClass">
            <p class="font-semibold">{{ importMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Raw JSON Editor -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-orange-100">
        <h2 class="text-2xl font-bold text-orange-600 mb-4">⚠️ Raw JSON Editor</h2>
        <p class="text-gray-600 mb-4">
          <strong>Advanced:</strong> Edit localStorage JSON directly. Changes are immediate and cannot be undone!
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Collections JSON
            </label>
            <textarea
              v-model="rawJson"
              rows="12"
              class="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-mono text-xs"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="validateJson"
              class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              Validate JSON
            </button>
            <button
              @click="saveRawJson"
              class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              Save Changes
            </button>
            <button
              @click="reloadRawJson"
              class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              Reload
            </button>
          </div>

          <div v-if="jsonMessage" class="p-4 rounded-xl border-2" :class="jsonMessageClass">
            <p class="font-semibold">{{ jsonMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Clear Stats Section -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-red-100">
        <h2 class="text-2xl font-bold text-red-600 mb-4">⚠️ Clear Data</h2>
        <p class="text-gray-600 mb-4">
          <strong>Warning:</strong> These actions cannot be undone!
        </p>

        <div class="space-y-3">
          <button
            @click="clearSelectedStats"
            :disabled="selectedCollections.length === 0"
            class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            Clear Stats for Selected Collections
          </button>

          <button
            @click="clearAllStats"
            class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            Clear All Stats (Keep Collections)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCollectionsStore } from '../stores/collections'
import {
  exportStats,
  exportCollections,
  generateShareUrl,
  validateImportData,
  decodeImportData,
  generateJsonString,
  downloadJsonFile,
  copyToClipboard,
  type ExportData
} from '../utils/dataManagement'
import type { Collection } from '../stores/collections'

const router = useRouter()
const collectionsStore = useCollectionsStore()

// Selection
const selectedCollections = ref<string[]>([])

// Export
const exportType = ref<'stats' | 'collections'>('stats')
const exportPreview = ref(false)
const exportMessage = ref('')
const shareUrl = ref('')

// Import
const importData = ref('')
const importMessage = ref('')
const importMessageClass = computed(() => {
  if (!importMessage.value) return ''
  return importMessage.value.includes('Error') || importMessage.value.includes('Invalid')
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-green-50 border-green-200 text-green-700'
})

// Raw JSON
const rawJson = ref('')
const jsonMessage = ref('')
const jsonMessageClass = computed(() => {
  if (!jsonMessage.value) return ''
  return jsonMessage.value.includes('Error') || jsonMessage.value.includes('Invalid')
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-green-50 border-green-200 text-green-700'
})

// Sorted collections
const sortedCollections = computed(() => {
  return [...collectionsStore.collections].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  })
})

onMounted(async () => {
  await collectionsStore.loadFromLocalStorage()
  reloadRawJson()
})

// Selection functions
const selectAll = () => {
  selectedCollections.value = collectionsStore.collections.map(c => c.id)
}

const deselectAll = () => {
  selectedCollections.value = []
}

const getSessionCount = (collection: Collection): number => {
  if (!collection.stats) return 0
  return collection.stats.reduce((total, stat) => total + (stat.sessions?.length || 0), 0)
}

// Export functions
const getSelectedCollections = (): Collection[] => {
  return collectionsStore.collections.filter(c => selectedCollections.value.includes(c.id))
}

const generateShareLink = async () => {
  const selected = getSelectedCollections()
  if (selected.length === 0) return

  const data: ExportData = exportType.value === 'stats'
    ? exportStats(selected)
    : exportCollections(selected)

  const baseUrl = window.location.origin + window.location.pathname
  shareUrl.value = generateShareUrl(data, baseUrl)

  const copied = await copyToClipboard(shareUrl.value)
  exportMessage.value = copied
    ? `Share link generated and copied to clipboard! (${selected.length} collection${selected.length > 1 ? 's' : ''})`
    : `Share link generated! Copy it manually from the field below.`
  exportPreview.value = true

  setTimeout(() => {
    exportPreview.value = false
    shareUrl.value = ''
  }, 10000)
}

const copyShareUrl = async () => {
  const copied = await copyToClipboard(shareUrl.value)
  if (copied) {
    exportMessage.value = 'Share URL copied to clipboard!'
  }
}

const copyJsonToClipboard = async () => {
  const selected = getSelectedCollections()
  if (selected.length === 0) return

  const data: ExportData = exportType.value === 'stats'
    ? exportStats(selected)
    : exportCollections(selected)

  const jsonString = generateJsonString(data, true)
  const copied = await copyToClipboard(jsonString)

  exportMessage.value = copied
    ? `JSON copied to clipboard! (${selected.length} collection${selected.length > 1 ? 's' : ''})`
    : 'Failed to copy to clipboard'
  exportPreview.value = true

  setTimeout(() => {
    exportPreview.value = false
  }, 3000)
}

const downloadJson = () => {
  const selected = getSelectedCollections()
  if (selected.length === 0) return

  const data: ExportData = exportType.value === 'stats'
    ? exportStats(selected)
    : exportCollections(selected)

  const filename = `flashcards-${exportType.value}-${new Date().toISOString().split('T')[0]}.json`
  downloadJsonFile(data, filename)

  exportMessage.value = `File downloaded! (${selected.length} collection${selected.length > 1 ? 's' : ''})`
  exportPreview.value = true

  setTimeout(() => {
    exportPreview.value = false
  }, 3000)
}

// Import functions
const validateAndImport = () => {
  const trimmed = importData.value.trim()
  if (!trimmed) return

  try {
    // Try to decode as base64 first
    let data: ExportData
    const decodeResult = decodeImportData(trimmed)

    if (decodeResult.data) {
      data = decodeResult.data
    } else {
      // Try parsing as raw JSON
      const parsed = JSON.parse(trimmed)
      const validation = validateImportData(parsed)

      if (!validation.valid) {
        importMessage.value = `Error: ${validation.error}`
        return
      }

      data = parsed as ExportData
    }

    // Navigate to appropriate import view
    const encodedData = btoa(JSON.stringify(data))
    if (data.type === 'stats') {
      router.push(`/importStats?data=${encodedData}`)
    } else {
      router.push(`/addCollections?collections=${encodedData}`)
    }
  } catch (error) {
    importMessage.value = 'Error: Invalid data format. Please check your input.'
  }
}

// Raw JSON functions
const reloadRawJson = () => {
  const stored = localStorage.getItem('flashcards-collections')
  rawJson.value = stored ? JSON.stringify(JSON.parse(stored), null, 2) : '[]'
  jsonMessage.value = ''
}

const validateJson = () => {
  try {
    JSON.parse(rawJson.value)
    jsonMessage.value = '✅ Valid JSON!'
    setTimeout(() => {
      jsonMessage.value = ''
    }, 3000)
  } catch (error) {
    jsonMessage.value = `❌ Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

const saveRawJson = () => {
  try {
    const parsed = JSON.parse(rawJson.value)

    const confirmed = confirm(
      'Are you sure you want to save these changes?\n\n' +
      'This will immediately update your collections data.\n' +
      'Make sure you have a backup!'
    )

    if (!confirmed) return

    localStorage.setItem('flashcards-collections', JSON.stringify(parsed))
    collectionsStore.loadFromLocalStorage()

    jsonMessage.value = '✅ Changes saved successfully!'
    setTimeout(() => {
      jsonMessage.value = ''
    }, 3000)
  } catch (error) {
    jsonMessage.value = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Clear functions
const clearSelectedStats = () => {
  if (selectedCollections.value.length === 0) return

  const confirmed = confirm(
    `Are you sure you want to clear stats for ${selectedCollections.value.length} collection(s)?\n\n` +
    'This will delete all practice session data but keep the collections and words.\n' +
    'This action cannot be undone!'
  )

  if (!confirmed) return

  selectedCollections.value.forEach(id => {
    const collection = collectionsStore.getCollectionById(id)
    if (collection) {
      collection.stats = []
    }
  })

  collectionsStore.saveToLocalStorage()
  alert(`Stats cleared for ${selectedCollections.value.length} collection(s)!`)
}

const clearAllStats = () => {
  const confirmed = confirm(
    'Are you sure you want to clear ALL stats?\n\n' +
    'This will delete all practice session data for ALL collections.\n' +
    'Collections and words will remain unchanged.\n' +
    'This action cannot be undone!'
  )

  if (!confirmed) return

  collectionsStore.collections.forEach(collection => {
    collection.stats = []
  })

  collectionsStore.saveToLocalStorage()
  reloadRawJson()
  alert('All stats cleared!')
}

const goBack = () => {
  router.push('/admin')
}
</script>
