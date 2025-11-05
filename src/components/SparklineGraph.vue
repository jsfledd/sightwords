<script setup lang="ts">
import { computed } from 'vue'
import type { AttemptRecord } from '../stores/collections'

interface Props {
  attempts: AttemptRecord[]
  width?: number
  height?: number
  showMinAttempts?: number // Minimum attempts needed to show graph
}

const props = withDefaults(defineProps<Props>(), {
  width: 100,
  height: 30,
  showMinAttempts: 3
})

// Calculate path for line graph
const graphPath = computed(() => {
  if (props.attempts.length < props.showMinAttempts) {
    return ''
  }

  const points: { x: number; y: number; accuracy: number }[] = []

  // Calculate rolling accuracy for each point
  for (let i = 0; i < props.attempts.length; i++) {
    const attemptsUpToNow = props.attempts.slice(0, i + 1)
    const correctCount = attemptsUpToNow.filter(a => a.correct).length
    const accuracy = (correctCount / (i + 1)) * 100

    const x = (i / Math.max(props.attempts.length - 1, 1)) * props.width
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

// Calculate color based on current accuracy
const currentAccuracy = computed(() => {
  if (props.attempts.length === 0) return 0
  const correctCount = props.attempts.filter(a => a.correct).length
  return (correctCount / props.attempts.length) * 100
})

const strokeColor = computed(() => {
  const acc = currentAccuracy.value
  if (acc >= 90) return '#10b981' // green-500
  if (acc >= 80) return '#eab308' // yellow-500
  if (acc >= 70) return '#f97316' // orange-500
  return '#ef4444' // red-500
})

// Create gradient for area fill
const gradientId = computed(() => {
  return `gradient-${Math.random().toString(36).substring(7)}`
})

// Calculate points for filled area
const areaPath = computed(() => {
  if (props.attempts.length < props.showMinAttempts) {
    return ''
  }

  const points: { x: number; y: number }[] = []

  // Calculate rolling accuracy for each point
  for (let i = 0; i < props.attempts.length; i++) {
    const attemptsUpToNow = props.attempts.slice(0, i + 1)
    const correctCount = attemptsUpToNow.filter(a => a.correct).length
    const accuracy = (correctCount / (i + 1)) * 100

    const x = (i / Math.max(props.attempts.length - 1, 1)) * props.width
    const y = props.height - (accuracy / 100) * props.height

    points.push({ x, y })
  }

  if (points.length === 0) return ''

  const firstPoint = points[0]
  if (!firstPoint) return ''

  // Start from bottom left
  let path = `M 0 ${props.height}`

  // Go up to first point
  path += ` L ${firstPoint.x} ${firstPoint.y}`

  // Follow the line
  for (let i = 1; i < points.length; i++) {
    const point = points[i]
    if (point) {
      path += ` L ${point.x} ${point.y}`
    }
  }

  // Go down to bottom right and close
  path += ` L ${props.width} ${props.height}`
  path += ` Z`

  return path
})

const hasEnoughData = computed(() => {
  return props.attempts.length >= props.showMinAttempts
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
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :style="`stop-color:${strokeColor};stop-opacity:0.3`" />
          <stop offset="100%" :style="`stop-color:${strokeColor};stop-opacity:0.05`" />
        </linearGradient>
      </defs>

      <!-- Filled area under the line -->
      <path
        :d="areaPath"
        :fill="`url(#${gradientId})`"
      />

      <!-- Line -->
      <path
        :d="graphPath"
        fill="none"
        :stroke="strokeColor"
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
