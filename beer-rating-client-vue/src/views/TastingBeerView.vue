<template>
  <!-- Navigation Bar -->
  <TastingSubNavbar />
  <div class="beer-list">
    <h1>Beer List</h1>
    <template v-if="addNewBeer">
      <!-- Use BeerForm for adding new beers -->
      <TastingBeerForm
        @submit="handleFormSubmit"
        @cancel="toggleAddBeerMode"
        @delete-action="handleFormSubmit"
        :beerStyles="beerStyles"
        :beer="selectedBeer"
        :isEdit="selectedBeer != undefined"
      />
    </template>
    <template v-else>
      <div class="filter-bar">
        <h2>Filters</h2>

        <!-- Text Field for Name Query -->
        <div class="filter-row">
          <input type="text" v-model="nameQuery" placeholder="Search by name" class="name-input" />
        </div>

        <!-- Apply Filters and Add Beer Buttons -->
        <div class="filter-row buttons-row">
          <button class="btn-secondary" @click="applyFilters">Apply Filters/Search</button>
          <button class="btn-primary" @click="toggleAddBeerMode" v-if="isLoggedIn">Add Beer</button>
        </div>
      </div>

      <div v-if="loading">
        <LoadingComponent />
      </div>
      <div v-else-if="error">
        <ErrorComponent :errorMessage="error" @retry="fetchBeers" />
      </div>
      <div v-else>
        <div class="beer-cards">
          <TastingBeerCard
            v-for="beer in beers"
            :key="beer._id"
            :beer="beer"
            @open-modal="openModal(beer)"
          />
        </div>
        <!-- Pagination Controls -->
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="page === 1">Previous</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="page === totalPages">Next</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import TastingSubNavbar from '@/components/TastingSubNavbar.vue'
import { Myconsts } from '@/const'
import type { TastingBeer } from '@/models/TastingBeer'
import TastingBeerCard from '@/components/TastingBeerCard.vue'
import TastingBeerForm from '@/components/TastingBeerForm.vue'

export default defineComponent({
  name: 'TastingBeerView',
  components: {
    TastingBeerCard,
    ErrorComponent,
    LoadingComponent,
    TastingBeerForm,
    TastingSubNavbar
  },
  setup() {
    const beers = ref<TastingBeer[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const page = ref(1)
    const totalPages = ref(1)
    const nameQuery = ref('') // New ref for name query
    const showModal = ref(false)
    const isLoggedIn = ref(false)
    const addNewBeer = ref(false)
    const beerStyles = ref([])
    const selectedBeer = ref<TastingBeer | undefined>(undefined)

    const token = localStorage.getItem(Myconsts.tokenName)
    isLoggedIn.value = !!token

    const fetchBeers = async () => {
      loading.value = true
      error.value = null
      try {
        // TODO: add option to change sort order and sort field
        // Sort by ABV in ascending order: ?sortField=abv&sortOrder=1
        // Sort by beer name in descending order: ?sortField=name&sortOrder=-1
        // posible fields name, abv, type(style), brewery, averageRating
        const nameQueryParam = nameQuery.value ? `q=${encodeURIComponent(nameQuery.value)}` : ''

        const limit = 35
        const url = `/api/tasting-beers?${nameQueryParam}&page=${page.value}&limit=${limit}&cache-buster=${new Date().getTime()}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()

        beers.value = data.docs
        beerStyles.value = data.allValidTypes
        totalPages.value = data.totalPages
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.log(error.value)
      } finally {
        loading.value = false
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

    const toggleAddBeerMode = () => {
      if (addNewBeer.value) {
        selectedBeer.value = undefined
      }
      addNewBeer.value = !addNewBeer.value
    }

    const handleFormSubmit = async () => {
      toggleAddBeerMode()
      await fetchBeers()
    }

    const openModal = async (beer: TastingBeer) => {
      selectedBeer.value = beer
      toggleAddBeerMode()
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
      nameQuery, // Include nameQuery in the return object
      applyFilters,
      showModal,
      isLoggedIn,
      addNewBeer,
      toggleAddBeerMode,
      handleFormSubmit,
      beerStyles,
      selectedBeer,
      openModal
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
  flex-direction: column;
  gap: 20px; /* Adds space between rows */
  margin-bottom: 20px;
  align-items: center; /* Center-aligns all items */
}

.filter-row {
  width: 100%; /* Full width for each row */
  display: flex;
  justify-content: center; /* Center content within row */
  flex-wrap: wrap; /* Wrap items if necessary */
}

.name-input {
  width: 100%; /* Full width for search input */
  max-width: 800px; /* Maximum width for larger screens */
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px; /* Space below the input */
}

.checkbox-label {
  margin: 0 10px;
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
  margin: 5px;
}

/* Disabled Button Styling */
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Hover effect for enabled buttons */
button:hover:not(:disabled) {
  background-color: #2980b9;
  cursor: pointer;
}

/* Primary Button Styling for 'Add Beer' */
.btn-primary {
  background-color: #2ecc71; /* Green */
}

.btn-primary:hover:not(:disabled) {
  background-color: #27ae60;
}

/* Secondary Button Styling for 'Apply Filters' */
.btn-secondary {
  background-color: #3498db; /* Blue */
}

.btn-secondary:hover:not(:disabled) {
  background-color: #2980b9;
}

/* Button Row Alignment */
.buttons-row {
  justify-content: center;
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

.sort-select-wrapper {
  display: flex;
  align-items: center;
}

.sort-select {
  padding: 8px;
  margin-right: 10px;
  font-size: 14px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.sort-select:hover {
  background-color: #e6e6e6;
  border-color: #888;
}

.sort-select:focus {
  outline: none;
  border-color: #007bff;
}

.sort-select option {
  padding: 8px;
  font-size: 14px;
}
</style>
