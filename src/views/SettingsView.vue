<template>
  <div class="min-h-screen px-4 py-8">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-4xl font-bold text-teal-700">Settings</h1>
        <button
          @click="goBack"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all"
        >
          Back
        </button>
      </div>
      <p class="text-gray-600">Configure your Sight Words experience</p>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Practice Settings Section -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100 mb-6">
        <h2 class="text-2xl font-bold text-teal-700 mb-4">Practice</h2>
        <p class="text-gray-600 mb-6">Customize how practice sessions work</p>

        <div class="space-y-4">
          <!-- Shuffle Words Setting -->
          <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="shuffleWords"
              v-model="localSettings.shuffleWords"
              @change="saveSettings"
              class="w-6 h-6 mt-1 text-teal-500 rounded focus:ring-2 focus:ring-teal-400 flex-shrink-0"
            />
            <div class="flex-1">
              <label for="shuffleWords" class="block text-lg font-semibold text-gray-800 mb-1 cursor-pointer">
                Shuffle Words
              </label>
              <p class="text-sm text-gray-600">
                Randomize the order of words at the start of each practice session
              </p>
            </div>
          </div>

          <!-- Recycle Incorrect Words Setting -->
          <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="recycleIncorrect"
              v-model="localSettings.recycleIncorrect"
              @change="saveSettings"
              class="w-6 h-6 mt-1 text-teal-500 rounded focus:ring-2 focus:ring-teal-400 flex-shrink-0"
            />
            <div class="flex-1">
              <label for="recycleIncorrect" class="block text-lg font-semibold text-gray-800 mb-1 cursor-pointer">
                Re-cycle Incorrect Words
              </label>
              <p class="text-sm text-gray-600">
                When you mark a word as incorrect, add it back into the practice queue so you'll see it again soon
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Management Section -->
      <div class="bg-white rounded-3xl shadow-lg p-6 border-2 border-teal-100 mb-6">
        <h2 class="text-2xl font-bold text-teal-700 mb-4">Data Management</h2>
        <p class="text-gray-600 mb-6">Manage your collections and progress data</p>

        <div class="space-y-4">
          <!-- Reset Collections Button -->
          <div class="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Reset Collections to Default</h3>
            <p class="text-sm text-gray-600 mb-4">
              This will replace all your collections with the default kindergarten word lists. Your custom collections and all progress data will be permanently deleted.
            </p>
            <button
              @click="confirmResetCollections"
              class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="showSaved" class="bg-green-50 border-2 border-green-200 rounded-3xl p-4 text-center">
        <p class="text-green-700 font-semibold">Settings saved!</p>
      </div>

      <!-- Reset Success Message -->
      <div v-if="showReset" class="bg-green-50 border-2 border-green-200 rounded-3xl p-4 text-center">
        <p class="text-green-700 font-semibold">Collections reset to defaults!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import { useCollectionsStore } from '../stores/collections'

const router = useRouter()
const settingsStore = useSettingsStore()
const collectionsStore = useCollectionsStore()

const localSettings = ref({
  shuffleWords: true,
  recycleIncorrect: true
})

const showSaved = ref(false)
const showReset = ref(false)

onMounted(() => {
  // Load current settings
  localSettings.value = { ...settingsStore.practiceSettings }
})

const saveSettings = () => {
  settingsStore.updatePracticeSettings(localSettings.value)

  // Show saved message
  showSaved.value = true
  setTimeout(() => {
    showSaved.value = false
  }, 2000)
}

const confirmResetCollections = () => {
  const confirmed = confirm(
    'Are you sure you want to reset all collections to the defaults?\n\n' +
    'This will:\n' +
    '- Delete all your custom collections\n' +
    '- Delete all progress data\n' +
    '- Restore the default kindergarten word lists\n\n' +
    'This action cannot be undone!'
  )

  if (confirmed) {
    resetCollections()
  }
}

const resetCollections = async () => {
  // Preserve stats before clearing
  const savedStats = collectionsStore.preserveStatsBeforeReset()

  // Clear localStorage
  localStorage.removeItem('flashcards-collections')
  localStorage.removeItem('flashcards-defaults-loaded')

  // Reload defaults
  await collectionsStore.loadDefaultCollections()

  // Restore stats for matching collection IDs
  collectionsStore.restoreStatsAfterReset(savedStats)

  // Show success message
  showReset.value = true
  setTimeout(() => {
    showReset.value = false
    // Navigate back to home to show the reset collections
    router.push('/')
  }, 2000)
}

const goBack = () => {
  router.push('/')
}
</script>
