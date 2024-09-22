<template>
  <div class="tasting-list">
    <h1>Tasting List</h1>
    <template v-if="addNewTasting">
      <!-- Use TastingForm for adding new tastings -->
      <!-- <TastingForm @submit="handleFormSubmit" @cancel="toggleAddTastingMode" /> -->
    </template>
    <template v-else>
      <div class="filter-bar">
        <h2>Filters</h2>

        <!-- Text Field for Name Query -->
        <div class="filter-row">
          <input type="text" v-model="nameQuery" placeholder="Search by name" class="name-input" />
        </div>

        <!-- Apply Filters and Add Tasting Buttons -->
        <div class="filter-row buttons-row">
          <button class="btn-secondary" @click="fetchTastings()">Apply Filters/Search</button>
          <button class="btn-primary" @click="toggleAddTastingMode">Add Tasting</button>
        </div>
      </div>

      <div v-if="loading">
        <LoadingComponent />
      </div>
      <div v-else-if="error">
        <ErrorComponent :errorMessage="error" @retry="fetchTastings" />
      </div>
      <div v-else>
        <div class="tasting-cards">
          <TastingCard v-for="tasting in tastings.docs" :key="tasting._id" :tasting="tasting" />
        </div>
        <!-- Pagination Controls -->
        <div class="pagination-controls">
          <button @click="goToPage(tastings.page - 1)" :disabled="!tastings.hasPrevPage">
            Previous
          </button>
          <span>Page {{ tastings.page }} of {{ tastings.totalPages }}</span>
          <button @click="goToPage(tastings.page + 1)" :disabled="!tastings.hasNextPage">
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import TastingCard from '@/components/TastingCard.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
//import TastingForm from '@/components/TastingForm.vue'
import { Myconsts } from '@/const'
import type { TastingModel } from '@/models/tastings'

export default defineComponent({
  name: 'TastingView',
  components: {
    TastingCard,
    ErrorComponent,
    LoadingComponent
    // TastingForm
  },
  setup() {
    const tastings = ref<TastingModel>({} as TastingModel)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const nameQuery = ref('')
    const showModal = ref(false)
    const addNewTasting = ref(false)

    const token = localStorage.getItem(Myconsts.tokenName)

    const fetchTastings = async (page: number = 1) => {
      loading.value = true
      error.value = null
      try {
        const nameQueryParam = nameQuery.value ? `q=${encodeURIComponent(nameQuery.value)}` : ''
        const limit = 35
        const url = `/api/beer-tastings?&${nameQueryParam}&page=${page}&limit=${limit}&cache-buster=${new Date().getTime()}`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching tastings: ${response.statusText}`)
        }
        const data = await response.json()
        console.log(data)

        tastings.value = data
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.log(error.value)
      } finally {
        loading.value = false
      }
    }

    const goToPage = (page: number) => {
      if (page > 0 && page <= tastings.value.totalPages) {
        fetchTastings(page)
      }
    }

    const toggleAddTastingMode = () => {
      addNewTasting.value = !addNewTasting.value
    }

    const handleFormSubmit = async () => {
      toggleAddTastingMode()
      await fetchTastings()
    }

    onMounted(fetchTastings)

    return {
      tastings,
      loading,
      error,
      fetchTastings,
      goToPage,
      nameQuery,
      showModal,
      addNewTasting,
      toggleAddTastingMode,
      handleFormSubmit
    }
  }
})
</script>

<style scoped>
.tasting-list {
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

/* Primary Button Styling for 'Add Tasting' */
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

.tasting-cards {
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
