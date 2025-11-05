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

// Calculate data points for visualization (always show 10 positions)
const dataPoints = computed(() => {
  const maxSessions = 10
  const points: { x: number; y: number; accuracy: number | null; color: string; hasData: boolean }[] = []

  // Calculate how many empty slots we need on the left
  const numSessions = props.sessions.length
  const numEmptySlots = Math.max(0, maxSessions - numSessions)

  // Create all 10 positions
  for (let i = 0; i < maxSessions; i++) {
    const x = (i / Math.max(maxSessions - 1, 1)) * props.width

    // First fill empty slots on the left, then add data from right
    if (i < numEmptySlots) {
      // Empty slot on the left - white circle on x-axis
      points.push({
        x,
        y: props.height,
        accuracy: null,
        color: 'white',
        hasData: false
      })
    } else {
      // Data point - get session from the sessions array
      const sessionIndex = i - numEmptySlots
      const session = props.sessions[sessionIndex]

      if (session && session.attempted > 0) {
        // Calculate accuracy as percentage: correct/attempted * 100
        const accuracy = (session.correct / session.attempted) * 100
        const y = props.height - (accuracy / 100) * props.height

        // Determine color based on accuracy
        let color: string
        if (accuracy >= 90) {
          color = '#10b981' // green-500
        } else if (accuracy >= 70) {
          color = '#84cc16' // lime-500
        } else if (accuracy >= 50) {
          color = '#eab308' // yellow-500
        } else if (accuracy >= 30) {
          color = '#f97316' // orange-500
        } else {
          color = '#ef4444' // red-500
        }

        points.push({ x, y, accuracy, color, hasData: true })
      } else {
        // Fallback: no data - white circle
        points.push({
          x,
          y: props.height,
          accuracy: null,
          color: 'white',
          hasData: false
        })
      }
    }
  }

  return points
})

// Calculate path for connecting line (connect all circles)
const linePath = computed(() => {
  if (dataPoints.value.length < 2) return ''

  const firstPoint = dataPoints.value[0]
  if (!firstPoint) return ''

  let path = `M ${firstPoint.x} ${firstPoint.y}`
  for (let i = 1; i < dataPoints.value.length; i++) {
    const point = dataPoints.value[i]
    if (point) {
      path += ` L ${point.x} ${point.y}`
    }
  }

  return path
})
</script>

<template>
  <div class="inline-block">
    <svg
      :width="width"
      :height="height"
      class="overflow-visible"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <!-- Connecting line (only between points with data) -->
      <path
        v-if="linePath"
        :d="linePath"
        fill="none"
        stroke="#d1d5db"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data point circles (colored if has data, transparent outline if no data) -->
      <circle
        v-for="(point, index) in dataPoints"
        :key="index"
        :cx="point.x"
        :cy="point.y"
        r="4"
        :fill="point.color"
        :stroke="point.hasData ? 'white' : '#d1d5db'"
        stroke-width="1.5"
      />
    </svg>
  </div>
</template>
