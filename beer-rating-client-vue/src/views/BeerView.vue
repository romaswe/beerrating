<template>
  <div class="beer-list">
    <h1>Beer List</h1>
    <template v-if="addNewBeer">
      <!-- Use BeerForm for adding new beers -->
      <BeerForm @submit="handleFormSubmit" @cancel="toggleAddBeerMode" :beerStyles="beerStyles" />
    </template>
    <template v-else>
      <div class="filter-bar">
        <h2>
          Filters
          <button class="btn-secondary" @click="toggleAdvancedSearchMode" v-if="isLoggedIn">
            {{ showAdvancedSearch ? 'Hide Advanced filters' : 'Show Advanced filters' }}
          </button>
        </h2>

        <!-- Text Field for Name Query -->
        <div class="filter-row">
          <input type="text" v-model="nameQuery" placeholder="Search by name" class="name-input" />
        </div>

        <!-- Checkboxes for Styles -->
        <div class="filter-row">
          <label v-for="style in beerStyles" :key="style" class="checkbox-label">
            <input type="checkbox" :value="style" v-model="selectedStyles" />
            {{ style }}
          </label>
        </div>

        <div class="advanced-search" v-if="showAdvancedSearch">
          <!-- Checkboxes for Breweries -->
          <div class="filter-row">
            <h3>Breweries</h3>
            <BrewerySelect
              :breweries="beerBreweries"
              :selectedBreweries="selectedBreweries"
              @update-selected-breweries="selectedBreweries = $event"
            />
          </div>

          <!-- ABV Range Filter -->
          <h3>ABV</h3>
          <div class="filter-row">
            <DoubleSlider
              :min="0"
              :max="100"
              :step="0.1"
              :initialMin="0"
              :initialMax="100"
              @update-min="onMinUpdate"
              @update-max="onMaxUpdate"
            />
          </div>

          <!-- Sort Order Dropdown -->
          <h3>Sort By</h3>
          <div class="filter-row sort-select-wrapper">
            <select v-model="selectedSortField" class="sort-select">
              <option value="averageRating">Average Rating</option>
              <option value="name">Name</option>
              <option value="abv">ABV</option>
              <option value="type">Beer Style</option>
              <option value="brewery">Brewery</option>
            </select>

            <select v-model="selectedSortOrder" class="sort-select">
              <option value="1">Ascending</option>
              <option value="-1">Descending</option>
            </select>
          </div>
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
          <BeerCard
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

    <!-- Beer Modal -->
    <BeerModal
      v-if="showModal"
      :beer="selectedBeer"
      @close-modal="closeModal"
      @updated-beerList="closeModalAndUpdate"
      :beerStyles="beerStyles"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import BeerCard from '@/components/BeerCard.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import BeerModal from '@/components/BeerModal.vue'
import BeerForm from '@/components/BeerForm.vue'
import DoubleSlider from '@/components/DoubleSlider.vue'
import BrewerySelect from '@/components/BrewerySelect.vue'
import type { Beer, Review } from '@/models/Beer'
import { Myconsts } from '@/const'

export default defineComponent({
  name: 'BeerView',
  components: {
    BeerCard,
    ErrorComponent,
    LoadingComponent,
    BeerModal,
    BeerForm,
    DoubleSlider,
    BrewerySelect
  },
  setup() {
    const beers = ref<Beer[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const page = ref(1)
    const totalPages = ref(1)
    const minAbv = ref<number | null>(null)
    const maxAbv = ref<number | null>(null)
    const selectedStyles = ref([])
    const selectedBreweries = ref([])
    const nameQuery = ref('') // New ref for name query
    const showModal = ref(false)
    const showAdvancedSearch = ref(false)
    const selectedBeer = ref<Beer>({} as Beer)
    const selectedRatings = ref<Review[]>([])
    const isLoggedIn = ref(false)
    const addNewBeer = ref(false)
    const selectedSortField = ref('averageRating') // Default sort field
    const selectedSortOrder = ref('-1') // Default sort order (Descending)

    const beerStyles = ref([])
    const beerBreweries = ref([])

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
        const stylesQuery = selectedStyles.value ? `styles=${selectedStyles.value.join(',')}` : ''
        const nameQueryParam = nameQuery.value ? `q=${encodeURIComponent(nameQuery.value)}` : ''
        const breweriesQuery = selectedBreweries.value
          ? `breweries=${selectedBreweries.value.join(',')}`
          : ''
        const minAbvParam = minAbv.value ? `abvMin=${minAbv.value}` : ''
        const maxAbvParam = maxAbv.value ? `abvMax=${maxAbv.value}` : ''
        const sortFieldParam = `sortField=${selectedSortField.value}`
        const sortOrderParam = `sortOrder=${selectedSortOrder.value}`
        const limit = 35
        const url = `/api/beers?${sortFieldParam}&${sortOrderParam}&${stylesQuery}&${nameQueryParam}&${breweriesQuery}&${minAbvParam}&${maxAbvParam}&page=${page.value}&limit=${limit}&cache-buster=${new Date().getTime()}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()

        beers.value = data.docs
        beerStyles.value = data.validBeerTypes
        totalPages.value = data.totalPages
        beerBreweries.value = data.allBreweries
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

    const openModal = async (beer: Beer) => {
      selectedBeer.value = beer
      showModal.value = true
    }

    const closeModal = async () => {
      showModal.value = false
      selectedBeer.value = {} as Beer
      selectedRatings.value = []
    }

    const closeModalAndUpdate = async () => {
      showModal.value = false
      selectedBeer.value = {} as Beer
      selectedRatings.value = []
      await fetchBeers()
    }

    const toggleAddBeerMode = () => {
      addNewBeer.value = !addNewBeer.value
    }

    const toggleAdvancedSearchMode = () => {
      // when toggeling off we should clear advanced search filters
      if (showAdvancedSearch.value) {
        console.log('Clearing advanced search filters')
        selectedSortField.value = 'averageRating' // Default sort field
        selectedSortOrder.value = '-1' // Default sort order (Descending)
        selectedBreweries.value = []
        minAbv.value = null
        maxAbv.value = null
      }
      showAdvancedSearch.value = !showAdvancedSearch.value
    }

    const onMinUpdate = (value: number) => {
      minAbv.value = value
    }
    const onMaxUpdate = (value: number) => {
      maxAbv.value = value
    }

    const handleFormSubmit = async () => {
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
      nameQuery, // Include nameQuery in the return object
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
      handleFormSubmit,
      closeModalAndUpdate,
      toggleAdvancedSearchMode,
      showAdvancedSearch,
      beerBreweries,
      selectedBreweries,
      minAbv,
      maxAbv,
      onMinUpdate,
      onMaxUpdate,
      selectedSortField,
      selectedSortOrder
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
