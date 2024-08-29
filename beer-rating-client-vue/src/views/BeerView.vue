<template>
  <div class="beer-list">
    <h1>Beer List</h1>
    <template v-if="addNewBeer">
      <!-- Use BeerForm for editing -->
      <BeerForm @submit="handleFormSubmit" @cancel="toggleAddBeerMode" @delete-action="handleFormSubmit" />
    </template>
    <template v-else>
      <div class="filter-bar">
        <label v-for="style in beerStyles" :key="style">
          <input type="checkbox" :value="style" v-model="selectedStyles" />
          {{ style }}
        </label>
        <!-- Apply Filters Button -->
        <button class="btn-secondary" @click="applyFilters">Apply Filters</button>
        <!-- Add Beer Button -->
        <button class="btn-primary" @click="toggleAddBeerMode" v-if="isLoggedIn">Add Beer</button>
      </div>
      <div v-if="loading">
        <LoadingComponent />
      </div>
      <div v-else-if="error">
        <ErrorComponent :errorMessage="error" @retry="fetchBeers" />
      </div>
      <div v-else>
        <div class="beer-cards">
          <BeerCard v-for="beer in beers" :key="beer._id" :beer="beer" @open-modal="openModal(beer._id)" />
        </div>
        <!-- Pagination Controls -->
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="page === 1">Previous</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="page === totalPages">Next</button>
        </div>
      </div>
    </template>
    <!-- Beer Modal -->
    <BeerModal v-if="showModal" :beer="selectedBeer" :ratings="selectedRatings" @close-modal="closeModal" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import BeerCard from '@/components/BeerCard.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import BeerModal from '@/components/BeerModal.vue'
import { BeerStyle } from '@/models/Beer'
import type { Beer, Rating } from '@/models/Beer'
import { Myconsts } from '@/const'
import BeerForm from '@/components/BeerForm.vue'

export default defineComponent({
  name: 'BeerView',
  components: {
    BeerCard,
    ErrorComponent,
    LoadingComponent,
    BeerModal,
    BeerForm
  },
  setup() {
    const beers = ref<Beer[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const page = ref(1)
    const totalPages = ref(1)
    const selectedStyles = ref<BeerStyle[]>([])
    const showModal = ref(false)
    const selectedBeer = ref<Beer>({} as Beer)
    const selectedRatings = ref<Rating[]>([])
    const isLoggedIn = ref(false);
    const addNewBeer = ref(false)

    const beerStyles = Object.values(BeerStyle)

    const token = localStorage.getItem(Myconsts.tokenName);
    isLoggedIn.value = !!token;

    const fetchBeers = async () => {
      loading.value = true
      error.value = null
      try {
        const stylesQuery = selectedStyles.value.join(',')
        const url = `/api/beers?styles=${stylesQuery}&page=${page.value}&limit=20`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()

        beers.value = data.docs
        totalPages.value = data.totalPages
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loading.value = false
      }
    }

    const fetchBeerDetails = async (beerId: Number) => {
      try {
        const url = `/api/beers/${beerId}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Error fetching beer details: ${response.statusText}`)
        }
        const data = await response.json()
        selectedBeer.value = data.beer
        selectedRatings.value = data.ratings
      } catch (err) {
        console.error('Error fetching beer details:', err)
      }
    }

    const nextPage = () => {
      if (page.value < totalPages.value) {
        page.value++
        fetchBeers()
      }
    }

    const prevPage = () => {
      if (page.value > 1) {
        page.value--
        fetchBeers()
      }
    }

    const applyFilters = () => {
      page.value = 1
      fetchBeers()
    }

    const openModal = (beerId: Number) => {
      fetchBeerDetails(beerId)
      showModal.value = true
    }

    const closeModal = async () => {
      showModal.value = false
      selectedBeer.value = {} as Beer
      selectedRatings.value = []
      await fetchBeers()
    }

    const toggleAddBeerMode = () => {
      addNewBeer.value = !addNewBeer.value
    }

    const handleFormSubmit = async (updatedBeer: Partial<Beer>) => {
      toggleAddBeerMode()
      await fetchBeers()
    }


    onMounted(fetchBeers)

    return {
      beers,
      loading,
      error,
      page,
      totalPages,
      fetchBeers,
      nextPage,
      prevPage,
      selectedStyles,
      beerStyles,
      applyFilters,
      showModal,
      selectedBeer,
      selectedRatings,
      openModal,
      closeModal,
      isLoggedIn,
      addNewBeer,
      toggleAddBeerMode,
      handleFormSubmit
    }
  }
})
</script>

<style scoped>
.beer-list {
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-bar label {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Unified Button Styling */
button {
  padding: 10px 15px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
}

/* Primary Button Styling for 'Add Beer' */
.btn-primary {
  background-color: #2ecc71;
  /* Green */
  margin-left: 10px;
}

.btn-primary:hover {
  background-color: #27ae60;
}

/* Secondary Button Styling for 'Apply Filters' */
.btn-secondary {
  background-color: #3498db;
  /* Blue */
}

.btn-secondary:hover {
  background-color: #2980b9;
}

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
</style>
