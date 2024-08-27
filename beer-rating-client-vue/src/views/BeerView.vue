<template>
  <div class="beer-list">
    <h1>Beer List</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">
      <!-- Use the ErrorComponent and pass the error message -->
      <ErrorComponent :errorMessage="error" @retry="fetchBeers" />
    </div>
    <div v-else>
      <BeerCard v-for="beer in beers" :key="beer.name" :beer="beer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import BeerCard from '@/components/BeerCard.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import type { Beer } from '@/models/Beer'

export default defineComponent({
  name: 'BeerView',
  components: {
    BeerCard,
    ErrorComponent
  },
  setup() {
    const beers = ref<Beer[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)

    const fetchBeers = async () => {
      loading.value = true
      error.value = null
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
        const url = `${backendUrl}/api/beers?page=1&limit=20` // TODO: Fix pagination
        const response = await fetch(url) // Replace with your API endpoint
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()
        beers.value = data
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.error('Error fetching beer data:', error.value)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchBeers)

    return {
      beers,
      loading,
      error,
      fetchBeers
    }
  }
})
</script>

<style scoped>
.beer-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
