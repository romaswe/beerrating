<template>
  <div class="beer-card">
    <h2>{{ beer.name }}</h2>
    <p><strong>Type:</strong> {{ beer.type }}</p>
    <p v-if="beer.brewery"><strong>Brewery:</strong> {{ beer.brewery }}</p>
    <p v-if="beer.abv"><strong>ABV:</strong> {{ beer.abv }}%</p>
    <p v-if="beer.averageRating"><strong>Average Rating:</strong> {{ beer.averageRating }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { BeerStyle } from '@/models/Beer'

interface Beer {
  name: string
  type: BeerStyle
  brewery?: string
  abv?: number
  averageRating?: number
}

export default defineComponent({
  name: 'BeerCard',
  props: {
    beer: {
      type: Object as PropType<Beer>,
      required: true
    }
  }
})
</script>

<style scoped>
.beer-card {
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
