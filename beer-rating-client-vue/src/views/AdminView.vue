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
        const response = await fetch(`/api/beer-types?page=${beerTypePage.value}&limit=30`, {
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
/* Admin View Container */
.admin-view {
  margin: 0 auto;
  padding: 30px 20px;
  text-align: center;
  background-color: #f8f9fa; /* Light background for the page */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Headings */
h1,
h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

h2 {
  margin-top: 40px;
  font-size: 1.5rem;
  color: #34495e;
}

/* User Cards and Beer Type List */
.user-cards,
.beer-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

/* Add Beer Type Form */
.add-beer-type-form {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

/* Input Field Styling */
.add-beer-type-form input {
  padding: 12px;
  font-size: 1rem;
  width: 300px;
  border-radius: 6px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease;
}

.add-beer-type-form input:focus {
  border-color: #3498db;
  outline: none;
}

/* Buttons */
button {
  padding: 12px 24px;
  font-size: 1rem;
  color: white;
  background-color: #3498db;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Green Button for Adding Beer Type */
.add-beer-type-form button {
  background-color: #2ecc71;
}

.add-beer-type-form button:hover:not(:disabled) {
  background-color: #27ae60;
}

/* Pagination Controls */
.pagination-controls {
  margin: 30px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination-controls button {
  padding: 10px 15px;
}

.pagination-controls span {
  font-size: 1.1rem;
  color: #555;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .add-beer-type-form input {
    width: 100%;
  }

  .admin-view {
    padding: 20px;
  }

  h1,
  h2 {
    font-size: 1.75rem;
  }

  button {
    font-size: 0.9rem;
    padding: 10px 15px;
  }
}
</style>
