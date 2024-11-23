<template>
  <h1>User stats for {{ stats.username }}</h1>
  <p>You have been a member for {{ stats.daysMember }} days</p>
  <p>You have rated a total of {{ stats.totalBeersRated }} beers</p>
  <p>
    Your total average rating is {{ stats.averageRating }} (Global average rating is
    {{ stats.averageRatingAllUsers }}) out of 5
  </p>
  <h2>Your beer styles</h2>
  <div class="top-beer-styles">
    <div v-for="style in stats.topBeerTypes" :key="style.beerType" class="style-item">
      <span class="style-label">Style:</span> {{ style.beerType }}
      <span class="style-label">Count:</span> {{ style.count }}
      <span class="style-label">Your Average Rating:</span> {{ style.averageRating }}
    </div>
  </div>
  <h2>Your top ten rated beers</h2>
  <div class="beer-cards" v-if="stats.topTenBeers.length > 0">
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
<style scoped>
.beer-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.top-beer-styles {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.style-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: calc(33.33% - 10px); /* 3 items per row, adjust as needed */
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.style-label {
  font-weight: bold;
  margin-right: 5px;
}

@media (max-width: 900px) {
  .style-item {
    width: calc(50% - 10px); /* 2 items per row on smaller screens */
  }
}

@media (max-width: 600px) {
  .style-item {
    width: 100%; /* 1 item per row on mobile screens */
  }
}
</style>
