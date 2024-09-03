<template>
  <div class="admin-view">
    <h1>User Management</h1>
    <!-- Show Loading Component while loading -->
    <LoadingComponent v-if="loading" />
    <!-- Show Error Component if there's an error -->
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
    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <button @click="prevPage" :disabled="page === 1">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import UserCard from '@/components/UserCard.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import { Myconsts } from '@/const'
import { UserRole } from '@/models/roles' // Import the UserRole enum

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
    ErrorComponent,
    LoadingComponent
  },
  setup() {
    const users = ref<User[]>([])
    const loading = ref(true)
    const error = ref<string | null>(null)
    const page = ref(1)
    const totalPages = ref(1)

    // Compute the role options from the enum
    const roleOptions = computed(() => Object.values(UserRole))

    const fetchUsers = async () => {
      loading.value = true
      error.value = null
      try {
        const token = localStorage.getItem(Myconsts.tokenName)
        const response = await fetch(`/api/admin/getUsers?page=${page.value}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`)
        }

        const data = await response.json()
        users.value = data.docs
        totalPages.value = data.totalPages
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      } finally {
        loading.value = false
      }
    }

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

    const nextPage = () => {
      if (page.value < totalPages.value) {
        page.value++
        fetchUsers()
      }
    }

    const prevPage = () => {
      if (page.value > 1) {
        page.value--
        fetchUsers()
      }
    }

    onMounted(fetchUsers)

    return {
      users,
      loading,
      error,
      page,
      totalPages,
      fetchUsers,
      updateUserRole,
      nextPage,
      prevPage,
      roleOptions // Return role options to the template
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

.user-cards {
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
