<template>
  <h1>All beers you have rated</h1>

  <div class="beer-cards">
    <BeerCard
      v-for="beer in userRatedBeers.docs"
      :key="beer._id"
      :beer="beer"
      @open-modal="openModal(beer)"
    />
  </div>
  <div class="pagination-controls">
    <button @click="goToPage(userRatedBeers.page - 1)" :disabled="!userRatedBeers.hasPrevPage">
      Previous
    </button>
    <span>Page {{ userRatedBeers.page }} of {{ userRatedBeers.totalPages }}</span>
    <button @click="goToPage(userRatedBeers.page + 1)" :disabled="!userRatedBeers.hasNextPage">
      Next
    </button>
  </div>

  <BeerModal
    v-if="showModal"
    :beer="selectedBeer"
    @close-modal="closeModal"
    @updated-beerList="closeModal"
  />
</template>

<script lang="ts">
import type { Beer, BeerModel } from '@/models/Beer'
import { defineComponent, ref, type PropType } from 'vue'
import BeerCard from './BeerCard.vue'
import BeerModal from './BeerModal.vue'

export default defineComponent({
  name: 'UserRatedBeersComponent',
  emits: ['changePage'],
  components: {
    BeerCard,
    BeerModal
  },
  props: {
    userRatedBeers: {
      type: {} as PropType<BeerModel>,
      default: () => []
    }
  },
  methods: {
    goToPage(page: number | null) {
      if (page !== null) {
        this.$emit('changePage', page)
      }
    }
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
.pagination-controls {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination-controls button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Ensure hover effect only applies to enabled buttons */
.pagination-controls button:hover:not(:disabled) {
  background-color: #2980b9;
}

/* Disabled state for pagination buttons */
.pagination-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
