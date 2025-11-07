import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'flashcards-settings'

export interface PracticeSettings {
  shuffleWords: boolean
  recycleIncorrect: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  const practiceSettings = ref<PracticeSettings>({
    shuffleWords: true,
    recycleIncorrect: true
  })

  // Load settings from localStorage
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        practiceSettings.value = {
          ...practiceSettings.value,
          ...parsed.practice
        }
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
    }
  }

  // Save settings to localStorage
  const saveToLocalStorage = () => {
    try {
      const data = {
        practice: practiceSettings.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving settings to localStorage:', error)
    }
  }

  // Update practice settings
  const updatePracticeSettings = (settings: Partial<PracticeSettings>) => {
    practiceSettings.value = {
      ...practiceSettings.value,
      ...settings
    }
    saveToLocalStorage()
  }

  // Initialize on store creation
  loadFromLocalStorage()

  return {
    practiceSettings,
    loadFromLocalStorage,
    updatePracticeSettings
  }
})
