<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div v-if="loading">
      <LoadingComponent />
    </div>
    <div v-else class="modal-content">
      <button
        v-if="!isEditing && !isAddingRating && isLoggedIn && beerStyles"
        @click="toggleEditMode"
        class="edit-button"
      >
        Edit
      </button>
      <template v-if="isEditing && beerStyles">
        <!-- Use BeerForm for editing -->
        <BeerForm
          :beer="beer"
          :isEdit="true"
          @submit="handleFormSubmit"
          @cancel="toggleEditMode"
          @delete-action="deleteAction"
          :beerStyles="beerStyles"
        />
      </template>
      <template v-else-if="isAddingRating">
        <RatingForm
          v-if="userRating && beer._id"
          :rating="userRating[0]"
          :isEdit="!!userRating[0]"
          :beerId="beer._id"
          @submit="handleRatingSubmit"
          @cancel="toggleRatingForm"
        />
      </template>
      <template v-else>
        <h2>{{ beer.name }}</h2>
        <div class="button-group">
          <a
            :href="`https://www.systembolaget.se/sortiment/?q=${encodeURIComponent(beer.name)}`"
            class="button button-systembolaget"
            target="_blank"
            rel="noopener noreferrer"
          >
            Systembolaget
          </a>
          <a
            :href="`https://untappd.com/search?q=${encodeURIComponent(beer.name)}`"
            class="button button-untappd"
            target="_blank"
            rel="noopener noreferrer"
          >
            Untappd
          </a>
          <a
            :href="`https://www.ratebeer.com/search?beername=${encodeURIComponent(beer.name)}&tab=beer`"
            class="button button-ratebeer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ratebeer
          </a>
        </div>
        <p><strong>Type:</strong> {{ formattedTypes }}</p>
        <p v-if="beer.brewery"><strong>Brewery:</strong> {{ beer.brewery }}</p>
        <p v-if="beer.abv"><strong>ABV:</strong> {{ beer.abv }}%</p>
        <p v-if="beer.averageRating"><strong>Average Rating:</strong> {{ beer.averageRating }}</p>

        <h3>Ratings</h3>
        <ul v-if="beer.reviews && beer.reviews.length">
          <li v-for="rating in displayedRatings" :key="rating._id">
            <strong>{{ rating.user ? rating.user.username : 'Unknown User' }}:</strong>
            {{ rating.score }} - {{ rating.comment }}
          </li>
        </ul>
        <p v-else>No ratings</p>

        <!-- Toggle button to show/hide more ratings -->
        <button
          v-if="beer.reviews && beer.reviews.length > 5"
          @click="toggleShowAllRatings"
          class="toggle-button"
        >
          {{ showAllRatings ? 'Hide ratings' : 'Show All Ratings' }}
        </button>
        <button
          v-if="isLoggedIn && !isAddingRating"
          @click="toggleRatingForm"
          class="add-rating-button"
        >
          Add Rating
        </button>
      </template>

      <button v-if="!isEditing && !isAddingRating" @click="closeModal" class="close-button">
        Close
      </button>
    </div>
    <div v-if="error" class="error-container">
      <ErrorComponent :errorMessage="error" @retry="fetchUserRating" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, computed } from 'vue'
import type { Beer, Review } from '@/models/Beer'
import BeerForm from '@/components/BeerForm.vue'
import RatingForm from '@/components/RatingForm.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import { Myconsts } from '@/const'

export default defineComponent({
  name: 'BeerModal',
  components: { BeerForm, RatingForm, ErrorComponent, LoadingComponent },
  props: {
    beer: {
      type: Object as PropType<Beer>,
      required: true
    },
    beerStyles: {
      type: Array as PropType<string[]>
    }
  },
  emits: ['close-modal', 'update-beer', 'updated-beerList'],
  setup(props, { emit }) {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const showAllRatings = ref(false)
    const isEditing = ref(false)
    const isAddingRating = ref(false)
    const isLoggedIn = ref(false)
    const userRating = ref<Review[] | null>(null)
    const token = localStorage.getItem(Myconsts.tokenName)

    isLoggedIn.value = !!token

    // Computed property to format the list of beer types
    const formattedTypes = computed(() => {
      return props.beer.type ? props.beer.type.join(', ') : '' // Join array of types with commas
    })

    const displayedRatings = computed(() => {
      return showAllRatings.value && props.beer.reviews
        ? props.beer.reviews
        : props.beer.reviews
          ? props.beer.reviews.slice(0, 5)
          : []
    })

    const fetchUserRating = async () => {
      try {
        error.value = null
        loading.value = true

        if (!token || !props.beer || !props.beer._id) {
          throw new Error('User is not authenticated or we cant find the beer')
        }

        const response = await fetch(`/api/ratings/user-ratings/${props.beer._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching user rating: ${response.statusText}`)
        }
        const data = await response.json()

        userRating.value = data // Assuming the response is the rating object
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.error('Failed to fetch user rating:', err)
      } finally {
        loading.value = false
      }
    }

    const toggleShowAllRatings = () => {
      showAllRatings.value = !showAllRatings.value
    }

    const toggleEditMode = () => {
      isEditing.value = !isEditing.value
    }

    const toggleRatingForm = () => {
      if (!isAddingRating.value) {
        // If we change to try to add rating we fetch this users ratings for this beer
        fetchUserRating()
      }
      isAddingRating.value = !isAddingRating.value
    }

    const handleFormSubmit = (updatedBeer: Partial<Beer>) => {
      Object.assign(props.beer, updatedBeer)
      emit('update-beer', updatedBeer)
      toggleEditMode()
    }

    const handleRatingSubmit = () => {
      emit('updated-beerList')
    }

    const closeModal = () => {
      emit('close-modal')
    }

    const deleteAction = () => {
      emit('updated-beerList')
    }

    return {
      showAllRatings,
      isEditing,
      displayedRatings,
      toggleShowAllRatings,
      toggleEditMode,
      handleFormSubmit,
      closeModal,
      isLoggedIn,
      deleteAction,
      isAddingRating,
      toggleRatingForm,
      handleRatingSubmit,
      userRating,
      formattedTypes,
      loading,
      error,
      fetchUserRating
    }
  }
})
</script>
<style scoped>
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.button {
  display: inline-block;
  padding: 8px 12px;
  text-decoration: none;
  color: white;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
}

.button-systembolaget {
  background-color: #004b9b;
}

.button-untappd {
  background-color: #f8a800;
}

.button-ratebeer {
  background-color: #4e4e4e;
}

.button:hover {
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

h2 {
  margin-top: 0;
}

.edit-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #27ae60;
}

.close-button,
.toggle-button {
  margin: 0.5rem;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-button:hover,
.toggle-button:hover {
  background-color: #2980b9;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

.add-rating-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-rating-button:hover {
  background-color: #27ae60;
}
</style>
