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
                When you mark a word as incorrect, add it back to the beginning of the practice queue to practice again
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="showSaved" class="bg-green-50 border-2 border-green-200 rounded-3xl p-4 text-center">
        <p class="text-green-700 font-semibold">Settings saved!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const localSettings = ref({
  shuffleWords: true,
  recycleIncorrect: true
})

const showSaved = ref(false)

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

const goBack = () => {
  router.push('/')
}
</script>
