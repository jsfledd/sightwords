<template>
  <div class="min-h-screen px-4 py-8 bg-gradient-to-br from-purple-50 to-purple-100">
    <!-- Header -->
    <div class="max-w-2xl mx-auto mb-8 text-center">
      <h1 class="text-5xl font-bold text-purple-700 mb-4">👨‍💼 Admin PWA</h1>
      <p class="text-lg text-gray-700 mb-6">
        Install the Sight Words Admin app to manage collections on the go.
      </p>
    </div>

    <div class="max-w-2xl mx-auto">
      <!-- Install Instructions -->
      <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-purple-200 mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">How to Install</h2>

        <div class="space-y-4 text-gray-700">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📱</span>
            <div>
              <h3 class="font-semibold mb-1">On Mobile (iOS/Android)</h3>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li>Open this page: <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{adminUrl}}</code></li>
                <li>Tap the share/menu button in your browser</li>
                <li>Select "Add to Home Screen"</li>
                <li>The app will open directly to the Admin view</li>
              </ol>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="text-2xl">💻</span>
            <div>
              <h3 class="font-semibold mb-1">On Desktop</h3>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                <li>Look for the install icon in your browser's address bar</li>
                <li>Click "Install" when prompted</li>
                <li>The admin app will open as a standalone window</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-purple-200 mb-6">
        <h2 class="text-2xl font-bold text-purple-700 mb-4">Admin Features</h2>
        <ul class="space-y-2 text-gray-700">
          <li class="flex items-center gap-2">
            <span class="text-green-500">✓</span>
            Create and edit word collections
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-500">✓</span>
            Generate shareable links
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-500">✓</span>
            Export collections to JSON
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-500">✓</span>
            Persistent storage - your changes are saved
          </li>
          <li class="flex items-center gap-2">
            <span class="text-green-500">✓</span>
            Works offline as a PWA
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="goToAdmin"
          class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-full shadow-lg transition-all"
        >
          Open Admin Panel
        </button>
        <button
          @click="copyAdminUrl"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg transition-all"
        >
          📋 Copy Admin URL
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="copied" class="mt-4 text-center text-green-600 font-semibold">
        Admin URL copied to clipboard!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const copied = ref(false)

const adminUrl = computed(() => {
  return window.location.origin + '/sightwords/admin.html'
})

const goToAdmin = () => {
  router.push('/admin')
}

const copyAdminUrl = () => {
  navigator.clipboard.writeText(adminUrl.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 3000)
  })
}
</script>
