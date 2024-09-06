<template>
  <div class="admin-view">
    <h1>User Management</h1>

    <!-- Show Loading Component while loading users -->
    <LoadingComponent v-if="loading" />

    <!-- Show Error Component if there's an error fetching users -->
    <ErrorComponent v-else-if="error" :errorMessage="error" @retry="fetchUsers" />

    <!-- Show User Cards when data is fetched -->
    <div v-else class="user-cards">
      <UserCard
        v-for="user in users"
        :key="user._id"
        :user="user"
        :roles="roleOptions"
        @update-role="updateUserRole"
      />
    </div>

    <!-- Pagination Controls for Users -->
    <div class="pagination-controls">
      <button @click="prevUserPage" :disabled="userPage === 1">Previous</button>
      <span>Page {{ userPage }} of {{ totalUserPages }}</span>
      <button @click="nextUserPage" :disabled="userPage === totalUserPages">Next</button>
    </div>

    <!-- Beer Type Management -->
    <h2>Beer Type Management</h2>

    <!-- Show Loading Component while loading beer types -->
    <LoadingComponent v-if="loadingBeerTypes" />

    <!-- Show Error Component if there's an error fetching beer types -->
    <ErrorComponent
      v-else-if="beerTypeError"
      :errorMessage="beerTypeError"
      @retry="fetchBeerTypes"
    />

    <!-- Show Beer Types when data is fetched -->
    <div v-else>
      <!-- Add Beer Type Form -->
      <div class="add-beer-type-form">
        <input v-model="newBeerTypeName" placeholder="New beer type name" />
        <button @click="addBeerType">Add Beer Type</button>
      </div>
      <div class="beer-type-list">
        <BeerTypeCard
          v-for="beerType in beerTypes"
          :key="beerType._id"
          :beerType="beerType"
          @delete-beer-type="deleteBeerType"
        />
      </div>

      <!-- Pagination Controls for beer types -->
      <div class="pagination-controls">
        <button @click="prevBeerTypesPage" :disabled="beerTypePage === 1">Previous</button>
        <span>Page {{ beerTypePage }} of {{ totalBeerTypePages }}</span>
        <button @click="nextBeerTypesPage" :disabled="beerTypePage === totalBeerTypePages">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import UserCard from '@/components/UserCard.vue'
import BeerTypeCard from '@/components/BeerTypeCard.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import { Myconsts } from '@/const'
import { UserRole } from '@/models/Roles'
import type { BeerType } from '@/models/BeerType'

// Define the User interface
interface User {
  _id: string
  username: string
  role: UserRole
}

export default defineComponent({
  name: 'AdminView',
  components: {
    UserCard,
    BeerTypeCard,
    ErrorComponent,
    LoadingComponent
  },
  setup() {
    // Users state
    const users = ref<User[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const userPage = ref(1)
    const totalUserPages = ref(1)
    const beerTypePage = ref(1)
    const totalBeerTypePages = ref(1)

    // Beer Types state
    const beerTypes = ref<BeerType[]>([])
    const loadingBeerTypes = ref(true)
    const beerTypeError = ref<string | null>(null)
    const newBeerTypeName = ref('')

    // Compute the role options from the enum
    const roleOptions = computed(() => Object.values(UserRole))

    // Fetch Users
    const fetchUsers = async () => {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem(Myconsts.tokenName)
        const response = await fetch(`/api/admin/getUsers?page=${userPage.value}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`)
        }

        const data = await response.json()
        users.value = data.docs
        totalUserPages.value = data.totalPages
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loading.value = false
      }
    }

    // Update User Role
    const updateUserRole = async (userId: string, newRole: UserRole) => {
      loading.value = true
      try {
        const token = localStorage.getItem(Myconsts.tokenName)
        const response = await fetch(`/api/admin/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        })

        if (!response.ok) {
          throw new Error(`Error updating user role: ${response.statusText}`)
        }

        fetchUsers()
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loading.value = false
      }
    }

    // Fetch Beer Types
    const fetchBeerTypes = async () => {
      loadingBeerTypes.value = true
      beerTypeError.value = null
      try {
        const token = localStorage.getItem(Myconsts.tokenName)
        const response = await fetch(`/api/beer-types?page=${beerTypePage.value}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Error fetching beer types: ${response.statusText}`)
        }
        const data = await response.json()
        beerTypes.value = data.docs
        totalBeerTypePages.value = data.totalPages
      } catch (err) {
        beerTypeError.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loadingBeerTypes.value = false
      }
    }

    // Add Beer Type
    const addBeerType = async () => {
      if (!newBeerTypeName.value.trim()) {
        return
      }
      loadingBeerTypes.value = true

      try {
        const token = localStorage.getItem(Myconsts.tokenName)
        const response = await fetch(`/api/beer-types`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newBeerTypeName.value })
        })

        if (!response.ok) {
          throw new Error(`Error adding beer type: ${response.statusText}`)
        }

        await fetchBeerTypes() // Refresh the list after adding
        newBeerTypeName.value = '' // Clear the input
      } catch (err) {
        beerTypeError.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loadingBeerTypes.value = false
      }
    }

    // Delete Beer Type
    const deleteBeerType = async (beerTypeId: string) => {
      loadingBeerTypes.value = true
      try {
        const token = localStorage.getItem(Myconsts.tokenName)
        const response = await fetch(`/api/beer-types/${beerTypeId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Error deleting beer type: ${response.statusText}`)
        }

        await fetchBeerTypes() // Refresh the list after deletion
      } catch (err) {
        beerTypeError.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loadingBeerTypes.value = false
      }
    }

    const nextUserPage = () => {
      if (userPage.value < totalUserPages.value) {
        userPage.value++
        fetchUsers()
      }
    }

    const prevUserPage = () => {
      if (userPage.value > 1) {
        userPage.value--
        fetchUsers()
      }
    }

    const nextBeerTypesPage = () => {
      if (beerTypePage.value < totalBeerTypePages.value) {
        beerTypePage.value++
        fetchBeerTypes()
      }
    }

    const prevBeerTypesPage = () => {
      if (beerTypePage.value > 1) {
        beerTypePage.value--
        fetchBeerTypes()
      }
    }

    onMounted(() => {
      fetchUsers()
      fetchBeerTypes()
    })

    return {
      users,
      loading,
      error,
      userPage,
      totalUserPages,
      fetchUsers,
      updateUserRole,
      nextUserPage,
      prevUserPage,
      roleOptions,

      // Beer Types
      beerTypes,
      loadingBeerTypes,
      beerTypeError,
      newBeerTypeName,
      addBeerType,
      deleteBeerType,
      fetchBeerTypes,
      nextBeerTypesPage,
      prevBeerTypesPage,
      beerTypePage,
      totalBeerTypePages
    }
  }
})
</script>

<style scoped>
.admin-view {
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.user-cards,
.beer-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.add-beer-type-form {
  margin-top: 20px;
}

.add-beer-type-form input {
  padding: 10px;
  font-size: 1rem;
  margin-right: 10px;
}

.add-beer-type-form button {
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-beer-type-form button:hover {
  background-color: #27ae60;
}

button {
  padding: 10px 20px;
  color: white;
  background-color: #3498db;
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
</style>
