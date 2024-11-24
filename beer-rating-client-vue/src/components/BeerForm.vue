<template>
  <div class="form-container">
    <!-- Show LoadingComponent when loading -->
    <LoadingComponent v-if="isLoading" />

    <!-- Show form when not loading -->
    <form v-else @submit.prevent="handleSubmit" class="beer-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>
      <div class="form-group">
        <label>Type</label>
        <!-- Checkboxes for multiple types -->
        <div class="checkbox-group">
          <label v-for="style in beerStyles" :key="style">
            <input type="checkbox" :value="style" v-model="form.type" />
            {{ style }}
          </label>
        </div>
      </div>
      <div class="form-group">
        <label for="brewery">Brewery</label>
        <input type="text" id="brewery" v-model="form.brewery" />
      </div>
      <div class="form-group">
        <label for="abv">ABV (%)</label>
        <input type="number" id="abv" v-model="form.abv" required step="0.1" min="0" max="100" />
      </div>
      <!-- Optional: Links to Systembolaget, Untapped, and Ratebeer -->
      <h3>WIP</h3>
      <div class="form-group">
        <label for="systembolaget-link">Systembolaget Link</label>
        <input type="url" id="systembolaget-link" v-model="form.matchedSites!.systembolaget!.url" />

        <label for="systembolaget-id">Systembolaget Number</label>
        <input type="text" id="systembolaget-id" v-model="form.matchedSites!.systembolaget!.id" />
      </div>

      <div class="button-group">
        <button type="submit" class="submit-button">
          {{ isEdit ? 'Update Beer' : 'Add Beer' }}
        </button>
        <button v-if="isEdit && isAdmin" type="button" @click="deleteAction" class="delete-button">
          Delete
        </button>
        <button type="button" @click="cancel" class="cancel-button">Cancel</button>
      </div>
    </form>

    <!-- Error message display -->
    <div v-if="error">
      <ErrorComponent :errorMessage="error" @retry="handleSubmit" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType, watch } from 'vue'
import { type Beer } from '@/models/Beer'
import { Myconsts } from '@/const'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'

export default defineComponent({
  name: 'BeerForm',
  props: {
    beer: {
      type: Object as PropType<Beer>,
      required: false
    },
    beerStyles: {
      type: Array as PropType<string[]>,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ErrorComponent,
    LoadingComponent
  },
  emits: ['submit', 'cancel', 'deleteAction'],
  setup(props, { emit }) {
    const isAdmin = ref(false)
    const error = ref<string | null>(null)
    const isLoading = ref(false)
    const form = ref<Partial<Beer>>({
      name: '',
      type: [] as string[],
      brewery: '',
      abv: undefined,
      matchedSites: {
        systembolaget: { url: '', id: '' },
        untappd: { url: '', id: '' },
        ratebeer: { url: '', id: '' }
      }
    })

    const role = localStorage.getItem(Myconsts.roleName)
    isAdmin.value = role === 'admin'

    const initializeForm = () => {
      if (props.isEdit && props.beer) {
        form.value = {
          name: props.beer.name || '',
          type: [...(props.beer.type || [])],
          brewery: props.beer.brewery || '',
          abv: props.beer.abv || undefined,
          matchedSites: {
            systembolaget: props.beer.matchedSites?.systembolaget || { url: '', id: '' },
            untappd: props.beer.matchedSites?.untappd || { url: '', id: '' },
            ratebeer: props.beer.matchedSites?.ratebeer || { url: '', id: '' }
          }
        }
      }
    }

    watch(
      () => props.beer,
      () => {
        initializeForm()
      },
      { immediate: true }
    )

    const handleSubmit = async () => {
      error.value = null
      try {
        isLoading.value = true
        const token = localStorage.getItem(Myconsts.tokenName)
        if (!token) {
          throw new Error('User is not authenticated')
        }

        let response
        form.value.name = form.value.name?.trim() || ''
        form.value.brewery = form.value.brewery?.trim() || ''
        //TODO: check urls and se if we can parse id if its not enterd
        if (props.isEdit && props.beer?._id) {
          response = await fetch(`/api/beers/${props.beer._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(form.value)
          })
        } else {
          response = await fetch(`/api/beers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(form.value)
          })
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to submit form')
        }

        const data = await response.json()
        emit('submit', data)
      } catch (err) {
        console.error('Failed to submit form:', error)
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        isLoading.value = false
      }
    }

    const cancel = () => {
      emit('cancel')
    }

    const deleteAction = async () => {
      error.value = null
      try {
        isLoading.value = true
        const token = localStorage.getItem(Myconsts.tokenName)
        if (!token) {
          throw new Error('User is not authenticated')
        }
        if (props.beer?._id) {
          const response = await fetch(`/api/beers/${props.beer._id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to delete beer')
          }

          emit('deleteAction', props.beer._id)
        }
      } catch (err) {
        console.error('Failed to delete beer:', error)
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      handleSubmit,
      cancel,
      error,
      deleteAction,
      isAdmin,
      isLoading
    }
  }
})
</script>
<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.beer-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
  color: #333;
}

input[type='text'],
input[type='number'] {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

input[type='text']:focus,
input[type='number']:focus {
  border-color: #3498db;
  outline: none;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.submit-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #2980b9;
}

.delete-button,
.cancel-button {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #c0392b;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 5px;
}
/* Responsive Design */
@media (max-width: 600px) {
  .form-container {
    padding: 15px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
