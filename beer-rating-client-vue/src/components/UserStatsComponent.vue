<template>
  <h1>User stats for {{ stats.username }}</h1>
  <p>You have been a member for {{ stats.daysMember }} days</p>
  <p>You have rated a total of {{ stats.totalBeersRated }} beers</p>
  <div class="beer-cards" v-if="stats.topTenBeers">
    <h2>Your top ten rated beers</h2>
    <BeerCard v-for="beer in stats.topTenBeers" :key="beer._id" :beer="beer" />
  </div>
</template>

<script lang="ts">
import type { Stats } from '@/models/Stats'
import { defineComponent, type PropType } from 'vue'
import BeerCard from './BeerCard.vue'

export default defineComponent({
  name: 'UserStatsComponent',
  props: {
    stats: {
      type: Object as PropType<Stats>,
      required: true
    }
  },
  components: {
    BeerCard
  },

  setup() {}
})
</script>
<style scoped></style>
