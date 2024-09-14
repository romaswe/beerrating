<template>
  <h1>User stats for {{ stats.username }}</h1>
  <p>You have been a member for {{ stats.daysMember }} days</p>
  <p>You have rated a total of {{ stats.totalBeersRated }} beers</p>
  <div class="beer-cards" v-if="stats.topTenBeers">
    <h2>Your top ten rated beers</h2>
    <BeerCard
      v-for="beer in stats.topTenBeers"
      :key="beer._id"
      :beer="beer"
      @open-modal="openModal(beer)"
    />
  </div>
  <!-- Beer Modal -->
  <BeerModal
    v-if="showModal"
    :beer="selectedBeer"
    @close-modal="closeModal"
    @updated-beerList="closeModal"
  />
</template>

<script lang="ts">
import type { Stats } from '@/models/Stats'
import { defineComponent, ref, type PropType } from 'vue'
import BeerCard from './BeerCard.vue'
import type { Beer } from '@/models/Beer'
import BeerModal from './BeerModal.vue'

export default defineComponent({
  name: 'UserStatsComponent',
  props: {
    stats: {
      type: Object as PropType<Stats>,
      required: true
    }
  },
  components: {
    BeerCard,
    BeerModal
  },

  setup() {
    const showModal = ref(false)
    const selectedBeer = ref<Beer>({} as Beer)

    const openModal = async (beer: Beer) => {
      selectedBeer.value = beer
      showModal.value = true
    }
    const closeModal = async () => {
      showModal.value = false
      selectedBeer.value = {} as Beer
    }

    return {
      closeModal,
      showModal,
      selectedBeer,
      openModal
    }
  }
})
</script>
<style scoped></style>
