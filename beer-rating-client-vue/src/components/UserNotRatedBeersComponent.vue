<template>
  <h1>Bulk Rate Beers</h1>
  <form @submit.prevent="submitRatings">
    <div v-for="beer in beers.docs" :key="beer._id" class="beer-item">
      <h3>{{ beer.name }}</h3>

      <!-- Rating Selector -->
      <label for="rating">Rating:</label>
      <select
        :value="getRatingValue(beer._id!, 'score')"
        @change="updateRating(beer._id!, 'score', $event)"
      >
        <option value="">Select a rating</option>
        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
      </select>

      <!-- Comment Input (Optional) -->
      <label for="comment">Comment (optional):</label>
      <input
        type="text"
        :value="getRatingValue(beer._id!, 'comment') || ''"
        @input="updateRating(beer._id!, 'comment', $event)"
      />
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

export default defineComponent({
  name: 'BulkRateBeers',
  props: {
    beers: {
      type: Object as () => BeerModel,
      required: true
    }
  },
  emits: ['changePage'],
  setup(props, { emit }) {
    // Reactive object to store modified ratings
    const modifiedRatings = ref<Record<string, { score: number | null; comment?: string }>>({})

    // Reactive state for tracking changes
    const hasChanges = ref(false)

    // Watch for changes in ratings to enable/disable the submit button
    watch(
      modifiedRatings,
      (newRatings) => {
        hasChanges.value = Object.keys(newRatings).some((id) => newRatings[id]?.score !== null)
      },
      { deep: true }
    )

    // Retrieve the rating or comment value for a specific beer
    const getRatingValue = (beerId: string, field: 'score' | 'comment') => {
      return modifiedRatings.value[beerId]?.[field] || null
    }

    // Update the rating object with changes
    const updateRating = (beerId: string, field: 'score' | 'comment', event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement
      if (target) {
        const value = field === 'score' ? Number(target.value) : target.value

        if (!modifiedRatings.value[beerId]) {
          modifiedRatings.value[beerId] = { score: null }
        }

        // Narrow the type of the field explicitly
        if (field === 'score') {
          modifiedRatings.value[beerId].score = value ? Number(value) : null
        } else if (field === 'comment') {
          modifiedRatings.value[beerId].comment = value ? String(value) : undefined
        }
      }
    }
    // Handle pagination
    const goToPage = (page: number) => {
      if (page > 0 && page <= props.beers.totalPages) {
        emit('changePage', page)
      }
    }

    // Submit only the modified ratings
    const submitRatings = async () => {
      const ratingsToSubmit = Object.entries(modifiedRatings.value)
        .filter(([_, rating]) => rating.score !== null)
        .map(([beerId, { score, comment }]) => ({
          beerId,
          score,
          comment: comment || '' // Optional comment
        }))

      if (ratingsToSubmit.length > 0) {
        try {
          const response = await fetch('/api/ratings/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ ratings: ratingsToSubmit })
          })

          if (response.ok) {
            // Success: Notify user and clear modified ratings
            alert('Ratings submitted successfully!')
            modifiedRatings.value = {} // Reset changes
            hasChanges.value = false
          } else {
            const errorData = await response.json()
            alert(`Error submitting ratings: ${errorData.message}`)
          }
        } catch (err) {
          console.error('Error submitting ratings:', err)
        }
      } else {
        alert('No ratings to submit!')
      }
    }

    return {
      modifiedRatings,
      updateRating,
      getRatingValue,
      submitRatings,
      goToPage,
      hasChanges
    }
  }
})
</script>

<style scoped>
.beer-item {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

label {
  margin-right: 10px;
}

input[type='text'] {
  margin-left: 10px;
}

.pagination-controls {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
