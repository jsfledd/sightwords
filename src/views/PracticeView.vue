<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-2xl">
      <!-- Practice Screen -->
      <div v-if="!finished" class="text-center">
        <!-- Progress -->
        <div class="mb-8">
          <p class="text-xl text-teal-700 mb-3 font-bold">
            {{ wordsRemaining }} word{{ wordsRemaining !== 1 ? 's' : '' }} remaining
          </p>
          <div class="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div
              class="bg-gradient-to-r from-teal-400 to-teal-600 h-4 rounded-full transition-all duration-500"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Current Word -->
        <div class="bg-white rounded-3xl shadow-2xl p-16 mb-10 border-4 border-teal-200">
          <h1 class="text-8xl font-bold text-teal-800">{{ queue[current]?.word }}</h1>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-6 justify-center">
          <button
            @click="mark(false)"
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-8 px-16 rounded-full text-3xl transition-all shadow-xl hover:shadow-2xl hover:scale-110"
          >
            ✗
          </button>
          <button
            @click="mark(true)"
            class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-8 px-16 rounded-full text-3xl transition-all shadow-xl hover:shadow-2xl hover:scale-110"
          >
            ✓
          </button>
        </div>

        <p class="mt-8 text-gray-600 text-lg font-medium">
          Mark ✓ if correct, ✗ to practice again
        </p>
      </div>

      <!-- Completion Screen -->
      <div v-else class="text-center">
        <div class="bg-white rounded-3xl shadow-2xl p-16 border-4 border-orange-200">
          <h1 class="text-6xl font-bold mb-6 text-teal-700">Yay! 🎉</h1>
          <p class="text-2xl text-gray-700 mb-10 font-medium">
            You've completed all {{ totalWords }} words!
          </p>
          <button
            @click="goBackToCollections"
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-full text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Back to Collections
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
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const route = useRoute()
const collectionsStore = useCollectionsStore()
const settingsStore = useSettingsStore()

const queue = ref<{ word: string; collectionId: string }[]>([])
const incorrectQueue = ref<{ word: string; collectionId: string }[]>([])
const current = ref(0)
const finished = ref(false)
const totalWords = ref(0)
const correctCount = ref(0)
const selectedCollectionIds = ref<string[]>([])

// Track session stats: key = "collectionId:word", value = { correct, attempted }
const sessionStats = ref<Map<string, { correct: number; attempted: number }>>(new Map())

const wordsRemaining = computed(() => {
  return queue.value.length - current.value + incorrectQueue.value.length
})

const progress = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((correctCount.value / totalWords.value) * 100)
})

onMounted(async () => {
  await initializePractice()
})

const initializePractice = async () => {
  // Ensure collections are loaded from localStorage
  await collectionsStore.loadFromLocalStorage()

  // Get selected collection IDs from query params
  const collectionsParam = route.query.collections as string
  if (!collectionsParam) {
    router.push('/')
    return
  }

  const collectionIds = collectionsParam.split(',')
  selectedCollectionIds.value = collectionIds

  // Build queue with word-collection pairs
  const wordPairs: { word: string; collectionId: string }[] = []
  collectionIds.forEach(id => {
    const collection = collectionsStore.getCollectionById(id)
    if (collection) {
      // Initialize stats for this collection if needed
      collectionsStore.initializeStats(id)
      collection.words.forEach(word => {
        wordPairs.push({ word, collectionId: id })
      })
    }
  })

  if (wordPairs.length === 0) {
    alert('No words found in selected collections')
    router.push('/')
    return
  }

  // Shuffle if setting is enabled, otherwise use as-is
  if (settingsStore.practiceSettings.shuffleWords) {
    queue.value = shuffle([...wordPairs])
  } else {
    queue.value = [...wordPairs]
  }

  totalWords.value = queue.value.length
  current.value = 0
  correctCount.value = 0
  finished.value = false
}

const shuffle = <T>(arr: T[]): T[] => {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp!
  }
  return shuffled
}

const mark = (correct: boolean) => {
  const currentItem = queue.value[current.value]
  if (!currentItem) return // Safety check

  // Track session stats for this word
  const key = `${currentItem.collectionId}:${currentItem.word}`
  const stats = sessionStats.value.get(key) || { correct: 0, attempted: 0 }
  stats.attempted++
  if (correct) {
    stats.correct++
  }
  sessionStats.value.set(key, stats)

  if (correct) {
    // Increment correct count only when marked correct
    correctCount.value++
  } else {
    // If incorrect and recycle setting is enabled, add word to incorrect queue
    if (settingsStore.practiceSettings.recycleIncorrect) {
      incorrectQueue.value.push(currentItem)
    }
  }

  current.value++

  // Check if we've gone through all words in the current queue
  if (current.value >= queue.value.length) {
    // If there are incorrect words to practice, add them to the queue and continue
    if (incorrectQueue.value.length > 0) {
      // Shuffle the incorrect queue if shuffle setting is enabled
      const incorrectWords = settingsStore.practiceSettings.shuffleWords
        ? shuffle([...incorrectQueue.value])
        : [...incorrectQueue.value]

      // Add incorrect words to the queue
      queue.value.push(...incorrectWords)

      // Clear the incorrect queue since we've added them back
      incorrectQueue.value = []

      // Don't increment current or mark as finished - just continue to next word
    } else {
      // No more words to practice, mark as finished
      finished.value = true
      saveSessionData()
    }
  }
}

const saveSessionData = () => {
  // Save session data for each word
  sessionStats.value.forEach((stats, key) => {
    const [collectionId, word] = key.split(':')
    if (collectionId && word) {
      collectionsStore.recordWordSession(collectionId, word, stats.correct, stats.attempted)
    }
  })
}

const goBackToCollections = () => {
  router.push('/')
}
</script>
