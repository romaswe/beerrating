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
        <label for="description">Description</label>
        <input type="text" id="description" v-model="form.description" />
      </div>

      <div class="button-group">
        <button type="submit" class="submit-button">
          {{ isEdit ? 'Update Tasting' : 'Add Tasting' }}
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
import { defineComponent, ref, type PropType, watch, toRefs } from 'vue'
import { Myconsts } from '@/const'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import type { Tasting } from '@/models/tastings'

export default defineComponent({
  name: 'TastingForm',
  props: {
    tasting: {
      type: Object as PropType<Tasting>,
      required: false
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
    const { tasting, isEdit } = toRefs(props)
    const form = ref<Partial<Tasting>>(
      isEdit.value && tasting.value
        ? { ...tasting.value }
        : {
            name: '',
            description: ''
          }
    )
    const role = localStorage.getItem(Myconsts.roleName)
    isAdmin.value = role === 'admin'

    const handleSubmit = async () => {
      error.value = null
      try {
        isLoading.value = true
        const token = localStorage.getItem(Myconsts.tokenName)
        if (!token) {
          throw new Error('User is not authenticated')
        }

        let response
        if (isEdit.value && tasting.value?._id) {
          // Trim whitespaces from form values before submission
          form.value.name = form.value.name?.trim() || ''
          form.value.description = form.value.description?.trim() || ''
          response = await fetch(`/api/beer-tastings/${tasting.value._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(form.value)
          })
        } else {
          response = await fetch(`/api/beer-tastings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(form.value)
          })
        }

        if (!response.ok) {
          if (response.status === 401) {
            console.log('Unauthorized')
            localStorage.removeItem(Myconsts.tokenName)
            localStorage.removeItem(Myconsts.roleName)
            localStorage.removeItem(Myconsts.userName)
          } else {
            const errorData = await response.json()
            throw new Error(
              `${errorData.message}\n ${errorData.error ?? ''}` || 'Failed to submit form'
            )
          }
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
        if (tasting.value?._id) {
          let response = await fetch(`/api/beer-tastings/${tasting.value._id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            if (response.status === 401) {
              console.log('Unauthorized')
              localStorage.removeItem(Myconsts.tokenName)
              localStorage.removeItem(Myconsts.roleName)
              localStorage.removeItem(Myconsts.userName)
            } else {
              const errorData = await response.json()
              throw new Error(
                `${errorData.message}\n ${errorData.error ?? ''}` || 'Failed to submit form'
              )
            }
          }

          const data = await response.json()
          emit('deleteAction', data)
        }
      } catch (err) {
        console.error('Failed to submit form:', error)
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        isLoading.value = false
      }
    }

    watch(isEdit, (newVal) => {
      if (newVal && tasting.value) {
        form.value = { ...tasting.value }
      } else {
        form.value = {
          name: '',
          description: ''
        }
      }
    })

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
