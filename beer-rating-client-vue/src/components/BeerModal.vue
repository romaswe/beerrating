<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button
        v-if="!isEditing && !isAddingRating && isLoggedIn"
        @click="toggleEditMode"
        class="edit-button"
      >
        Edit
      </button>
      <template v-if="isEditing">
        <!-- Use BeerForm for editing -->
        <BeerForm
          :beer="beer"
          :isEdit="true"
          @submit="handleFormSubmit"
          @cancel="toggleEditMode"
          @delete-action="deleteAction"
        />
      </template>
      <template v-else-if="isAddingRating">
        <RatingForm
          :rating="userRating?.[0]"
          :isEdit="!!userRating?.[0]"
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
        <p><strong>Type:</strong> {{ beer.type }}</p>
        <p v-if="beer.brewery"><strong>Brewery:</strong> {{ beer.brewery }}</p>
        <p v-if="beer.abv"><strong>ABV:</strong> {{ beer.abv }}%</p>
        <p v-if="beer.averageRating"><strong>Average Rating:</strong> {{ beer.averageRating }}</p>

        <h3>Ratings</h3>
        <ul v-if="ratings.length">
          <li v-for="(rating, index) in displayedRatings" :key="rating._id">
            <strong>{{ rating.user.username }}:</strong> {{ rating.score }} - {{ rating.comment }}
          </li>
        </ul>
        <p v-else>No ratings</p>

        <!-- Toggle button to show/hide more ratings -->
        <button v-if="ratings.length > 5" @click="toggleShowAllRatings" class="toggle-button">
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

      <button @click="closeModal" class="close-button">Close</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, computed, watch } from 'vue'
import type { Beer, Rating } from '@/models/Beer'
import BeerForm from '@/components/BeerForm.vue'
import RatingForm from '@/components/RatingForm.vue'
import { Myconsts } from '@/const'

export default defineComponent({
  name: 'BeerModal',
  components: { BeerForm, RatingForm },
  props: {
    beer: {
      type: Object as PropType<Beer>,
      required: true
    },
    ratings: {
      type: Array as PropType<Rating[]>,
      required: true
    }
  },
  emits: ['close-modal', 'update-beer'],
  setup(props, { emit }) {
    const showAllRatings = ref(false)
    const isEditing = ref(false)
    const isAddingRating = ref(false)
    const isLoggedIn = ref(false)
    const userRating = ref<Rating[] | null>(null) // Define as array of Rating or null
    const token = localStorage.getItem(Myconsts.tokenName)

    isLoggedIn.value = !!token

    const displayedRatings = computed(() => {
      return showAllRatings.value ? props.ratings : props.ratings.slice(0, 5)
    })

    const fetchUserRating = async () => {
      if (!token || !props.beer || !props.beer._id) return
      try {
        const response = await fetch(`/api/ratings/user-ratings/${props.beer._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching user rating: ${response.statusText}`)
        }
        const data = await response.json()

        userRating.value = data // Assuming the response is an array of rating objects
      } catch (err) {
        console.error('Failed to fetch user rating:', err)
      }
    }

    // Watch for changes in the beer prop and fetch user ratings when it updates
    watch(
      () => props.beer,
      (newBeer) => {
        if (newBeer && newBeer._id) {
          fetchUserRating()
        }
      },
      { immediate: true }
    )

    const toggleShowAllRatings = () => {
      showAllRatings.value = !showAllRatings.value
    }

    const toggleEditMode = () => {
      isEditing.value = !isEditing.value
    }

    const toggleRatingForm = () => {
      isAddingRating.value = !isAddingRating.value
    }

    const handleFormSubmit = (updatedBeer: Partial<Beer>) => {
      Object.assign(props.beer, updatedBeer)
      emit('update-beer', updatedBeer)
      toggleEditMode()
    }

    const handleRatingSubmit = (newRating: Rating) => {
      /*if (newRating) {
                  userRating.value = newRating;
              }
              toggleRatingForm();*/
      closeModal()
    }

    const closeModal = () => {
      emit('close-modal')
    }

    const deleteAction = () => {
      closeModal()
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
      userRating
    }
  }
})
</script>
