<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-2xl">
      <!-- Practice Screen -->
      <div v-if="!finished" class="text-center">
        <!-- Progress -->
        <div class="mb-8">
          <p class="text-lg text-gray-600 mb-2">
            {{ wordsRemaining }} word{{ wordsRemaining !== 1 ? 's' : '' }} remaining
          </p>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Current Word -->
        <div class="bg-white rounded-lg shadow-xl p-12 mb-8">
          <h1 class="text-7xl font-bold text-gray-900">{{ queue[current] }}</h1>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 justify-center">
          <button
            @click="mark(false)"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-12 rounded-lg text-2xl transition-colors"
          >
            ✗
          </button>
          <button
            @click="mark(true)"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-12 rounded-lg text-2xl transition-colors"
          >
            ✓
          </button>
        </div>

        <p class="mt-6 text-gray-600">
          Mark ✓ if correct, ✗ to practice again
        </p>
      </div>

      <!-- Completion Screen -->
      <div v-else class="text-center">
        <div class="bg-white rounded-lg shadow-xl p-12">
          <h1 class="text-5xl font-bold mb-4 text-gray-900">Yay! 🎉</h1>
          <p class="text-xl text-gray-700 mb-8">
            You've completed all {{ totalWords }} words!
          </p>
          <button
            @click="goBackToCollections"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
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

const router = useRouter()
const route = useRoute()
const collectionsStore = useCollectionsStore()

const queue = ref<string[]>([])
const current = ref(0)
const finished = ref(false)
const totalWords = ref(0)
const correctCount = ref(0)

const wordsRemaining = computed(() => {
  return queue.value.length - current.value
})

const progress = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((correctCount.value / totalWords.value) * 100)
})

onMounted(() => {
  initializePractice()
})

const initializePractice = () => {
  // Get selected collection IDs from query params
  const collectionsParam = route.query.collections as string
  if (!collectionsParam) {
    router.push('/')
    return
  }

  const collectionIds = collectionsParam.split(',')
  const words = collectionsStore.getWordsFromCollections(collectionIds)

  if (words.length === 0) {
    alert('No words found in selected collections')
    router.push('/')
    return
  }

  // Shuffle and initialize queue
  queue.value = shuffle([...words])
  totalWords.value = queue.value.length
  current.value = 0
  correctCount.value = 0
  finished.value = false
}

const shuffle = (arr: string[]): string[] => {
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
  const currentWord = queue.value[current.value]
  if (!currentWord) return // Safety check

  if (correct) {
    // Increment correct count only when marked correct
    correctCount.value++
  } else {
    // If incorrect, add word back to the end of queue
    queue.value.push(currentWord)
  }

  current.value++

  // Check if we've gone through all words in the queue
  if (current.value >= queue.value.length) {
    finished.value = true
  }
}

const goBackToCollections = () => {
  router.push('/')
}
</script>
