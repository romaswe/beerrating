<template>
  <h1>Bulk Rate Beers</h1>
  <div v-if="beers.docs.length >= 1">
    <p class="warning">You need to submit page by page</p>
    <p class="warning">
      After you submit the page will reload and refetch the beers you have not given a rating
    </p>
  </div>
  <div v-if="loading">
    <LoadingComponent />
  </div>
  <div v-else-if="error">
    <ErrorComponent :errorMessage="error" @retry="submitRatings" />
  </div>
  <form v-else @submit.prevent="submitRatings">
    <div class="beer-container">
      <div v-for="beer in beers.docs" :key="beer._id" class="beer-item">
        <h3>{{ beer.brewery }} - {{ beer.name }}</h3>
        <p>Style: {{ beer.type ? beer.type.join(', ') : '' }}</p>
        <p>Average Rating: {{ beer.averageRating }}</p>

        <!-- Rating Input (Slider or Number Input) -->
        <label for="rating">Rating:</label>
        <span>{{ getRatingValue(beer._id!, 'score') || 0 }}</span>
        <input
          type="range"
          min="0"
          max="5"
          step="0.25"
          :value="getRatingValue(beer._id!, 'score') || 0"
          @input="updateRating(beer._id!, 'score', $event)"
        />

        <!-- Comment Input (Optional) -->
        <label for="comment">Comment (optional):</label>
        <input
          type="text"
          :value="getRatingValue(beer._id!, 'comment') || ''"
          @input="updateRating(beer._id!, 'comment', $event)"
        />
      </div>
    </div>

    <!-- Submit Button -->
    <button type="submit" :disabled="!hasChanges">Submit Ratings</button>
  </form>

  <!-- Pagination Controls -->
  <div class="pagination-controls">
    <button @click="goToPage(beers.page - 1)" :disabled="!beers.hasPrevPage">Previous</button>
    <span>Page {{ beers.page }} of {{ beers.totalPages }}</span>
    <button @click="goToPage(beers.page + 1)" :disabled="!beers.hasNextPage">Next</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { BeerModel } from '@/models/Beer'
import { Myconsts } from '@/const'
import ErrorComponent from './ErrorComponent.vue'
import LoadingComponent from './LoadingComponent.vue'

export default defineComponent({
  name: 'BulkRateBeers',
  props: {
    beers: {
      type: Object as () => BeerModel,
      required: true
    }
  },
  components: {
    ErrorComponent,
    LoadingComponent
  },
  emits: ['changePage'],
  setup(props, { emit }) {
    const modifiedRatings = ref<Record<string, { score: number | null; comment?: string }>>({})
    const hasChanges = ref(false)
    const token = localStorage.getItem(Myconsts.tokenName)
    const loading = ref(false)
    const error = ref<string | null>(null)

    watch(
      modifiedRatings,
      (newRatings) => {
        hasChanges.value = Object.keys(newRatings).some((id) => newRatings[id]?.score !== null)
      },
      { deep: true }
    )

    const getRatingValue = (beerId: string, field: 'score' | 'comment') => {
      return modifiedRatings.value[beerId]?.[field] || null
    }

    const updateRating = (beerId: string, field: 'score' | 'comment', event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement
      if (target) {
        const value = field === 'score' ? Number(target.value) : target.value

        if (!modifiedRatings.value[beerId]) {
          modifiedRatings.value[beerId] = { score: null }
        }

        if (field === 'score') {
          modifiedRatings.value[beerId].score = value ? Number(value) : null
        } else if (field === 'comment') {
          modifiedRatings.value[beerId].comment = value ? String(value) : undefined
        }
      }
    }

    const goToPage = (page: number) => {
      if (page > 0 && page <= props.beers.totalPages) {
        emit('changePage', page)
      }
    }

    const submitRatings = async () => {
      const ratingsToSubmit = Object.entries(modifiedRatings.value)
        .filter(([_, rating]) => rating.score !== null)
        .map(([beerId, { score, comment }]) => ({
          beerId,
          score,
          comment: comment || ''
        }))

      if (ratingsToSubmit.length > 0) {
        loading.value = true
        error.value = null
        try {
          const response = await fetch('/api/ratings/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ratings: ratingsToSubmit })
          })

          if (response.ok) {
            modifiedRatings.value = {}
            hasChanges.value = false
            emit('changePage')
          } else {
            if (response.status === 401) {
              console.log('Unauthorized')
              localStorage.removeItem(Myconsts.tokenName)
              localStorage.removeItem(Myconsts.roleName)
              localStorage.removeItem(Myconsts.userName)
            } else {
              const errorData = await response.json()
              error.value = errorData.message
            }
          }
        } catch (err) {
          console.error('Error submitting ratings:', err)
          error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        } finally {
          loading.value = false
        }
      } else {
        console.log('No ratings to submit')
      }
    }

    return {
      modifiedRatings,
      updateRating,
      getRatingValue,
      submitRatings,
      goToPage,
      hasChanges,
      loading,
      error
    }
  }
})
</script>

<style scoped>
.beer-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

.beer-item {
  flex: 1 1 200px;
  max-width: 100%;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.beer-item:hover {
  transform: translateY(-5px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.2);
}

label {
  display: inline-block;
  margin-right: 10px;
  margin-top: 10px;
  font-weight: bold;
}

input[type='text'] {
  margin-left: 10px;
}

input[type='range'] {
  margin-top: 5px;
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .beer-item {
    flex: 1 1 100%;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .beer-item {
    flex: 1 1 calc(50% - 20px);
  }
}

@media (min-width: 1201px) {
  .beer-item {
    flex: 1 1 calc(33% - 20px);
  }
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

.warning {
  color: red;
}

button {
  padding: 8px 16px;
  background-color: #3498db;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

button:hover:enabled {
  background-color: #2980b9;
}
</style>
