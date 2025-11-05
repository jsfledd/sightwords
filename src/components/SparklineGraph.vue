<script setup lang="ts">
import { computed } from 'vue'
import type { SessionRecord } from '../stores/collections'

interface Props {
  sessions: SessionRecord[]
  width?: number
  height?: number
  showMinSessions?: number // Minimum sessions needed to show graph
}

const props = withDefaults(defineProps<Props>(), {
  width: 100,
  height: 30,
  showMinSessions: 3
})

// Calculate path for line graph
const graphPath = computed(() => {
  if (props.sessions.length < props.showMinSessions) {
    return ''
  }

  const points: { x: number; y: number; accuracy: number }[] = []

  // Calculate accuracy for each session
  for (let i = 0; i < props.sessions.length; i++) {
    const session = props.sessions[i]
    if (!session) continue

    // Calculate accuracy as percentage: correct/attempted * 100
    const accuracy = session.attempted > 0 ? (session.correct / session.attempted) * 100 : 0

    const x = (i / Math.max(props.sessions.length - 1, 1)) * props.width
    const y = props.height - (accuracy / 100) * props.height

    points.push({ x, y, accuracy })
  }

  // Create SVG path
  if (points.length === 0) return ''

  const firstPoint = points[0]
  if (!firstPoint) return ''

  let path = `M ${firstPoint.x} ${firstPoint.y}`
  for (let i = 1; i < points.length; i++) {
    const point = points[i]
    if (point) {
      path += ` L ${point.x} ${point.y}`
    }
  }

  return path
})

// Create vertical gradient for accuracy levels (red at bottom, green at top)
const gradientId = computed(() => {
  return `gradient-${Math.random().toString(36).substring(7)}`
})

const hasEnoughData = computed(() => {
  return props.sessions.length >= props.showMinSessions
})
</script>

<template>
  <div class="inline-block">
    <svg
      v-if="hasEnoughData"
      :width="width"
      :height="height"
      class="overflow-visible"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <defs>
        <!-- Vertical gradient from red (bottom) to green (top) -->
        <linearGradient :id="gradientId" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />   <!-- red-500: 0-70% -->
          <stop offset="50%" stop-color="#eab308" />  <!-- yellow-500: 80% -->
          <stop offset="100%" stop-color="#10b981" /> <!-- green-500: 100% -->
        </linearGradient>
      </defs>

      <!-- Line with gradient stroke -->
      <path
        :d="graphPath"
        fill="none"
        :stroke="`url(#${gradientId})`"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Placeholder when not enough data -->
    <div
      v-else
      :style="{ width: `${width}px`, height: `${height}px` }"
      class="flex items-center justify-center text-gray-300 text-xs"
    >
      <span>—</span>
    </div>
  </div>
</template>
