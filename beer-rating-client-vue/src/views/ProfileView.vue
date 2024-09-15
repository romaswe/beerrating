<template>
  <!-- Navigation Bar -->
  <nav class="navbar">
    <ul class="nav-list">
      <li :class="{ active: activeTab === 'stats' }" @click="setActiveTab('stats')">
        <a href="#">User Stats</a>
      </li>
      <li :class="{ active: activeTab === 'rated' }" @click="setActiveTab('rated')">
        <a href="#">Rated Beers</a>
      </li>
      <li :class="{ active: activeTab === 'unrated' }" @click="setActiveTab('unrated')">
        <a href="#">Unrated Beers</a>
      </li>
    </ul>
  </nav>

  <!-- Content based on the active tab -->
  <div class="profile-content">
    <div v-if="loading">
      <LoadingComponent />
    </div>
    <div v-else-if="error">
      <ErrorComponent :errorMessage="error" :showRetry="false" />
    </div>
    <div v-else>
      <UserStatsComponent :stats="userStats" v-if="activeTab === 'stats'" />
      <UserRatedBeersComponent
        v-if="activeTab === 'rated'"
        :userRatedBeers="userRatedBeers"
        @changePage="fetchUserRatedBeers"
      />
      <UserNotRatedBeersComponent v-if="activeTab === 'unrated'" />
    </div>
  </div>
</template>

<script lang="ts">
import ErrorComponent from '@/components/ErrorComponent.vue'
import LoadingComponent from '@/components/LoadingComponent.vue'
import UserNotRatedBeersComponent from '@/components/UserNotRatedBeersComponent.vue'
import UserRatedBeersComponent from '@/components/UserRatedBeersComponent.vue'
import UserStatsComponent from '@/components/UserStatsComponent.vue'
import { Myconsts } from '@/const'
import type { BeerModel } from '@/models/Beer'
import type { Stats } from '@/models/Stats'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'ProfileView',
  components: {
    UserStatsComponent,
    UserRatedBeersComponent,
    UserNotRatedBeersComponent,
    LoadingComponent,
    ErrorComponent
  },
  setup() {
    const loading = ref(true)
    const error = ref<string | null>(null)

    const userStats = ref<Stats>({} as Stats)
    const userRatedBeers = ref<BeerModel>({} as BeerModel)

    const token = localStorage.getItem(Myconsts.tokenName)

    const activeTab = ref('stats')

    const setActiveTab = async (tab: string) => {
      if (tab === 'stats') {
        await fetchUserStats()
      } else if (tab === 'rated') {
        await fetchUserRatedBeers()
      } else if (tab === 'unrated') {
        await fetchUserUnratedRatedBeers()
      }
      activeTab.value = tab
    }

    onMounted(async () => {
      await fetchUserStats()
    })

    const fetchUserStats = async () => {
      loading.value = true
      error.value = null
      try {
        const url = `/api/stats/user-stats`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()
        userStats.value = data
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.log(error.value)
      } finally {
        loading.value = false
      }
    }

    const fetchUserRatedBeers = async (page = 1, limit = 25) => {
      // TODO: Handle pagination
      loading.value = true
      error.value = null
      try {
        const url = `/api/ratings/rated?page=${page}&limit=${limit}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()
        userRatedBeers.value = data
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.log(error.value)
      } finally {
        loading.value = false
      }
    }
    const fetchUserUnratedRatedBeers = async (page = 1, limit = 25) => {
      loading.value = true
      error.value = null
      try {
        const url = `/api/ratings/unrated?page=${page}&limit=${limit}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }
        const data = await response.json()
        console.log(data)
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.log(error.value)
      } finally {
        loading.value = false
      }
    }
    return {
      activeTab,
      setActiveTab,
      error,
      loading,
      userStats,
      userRatedBeers,
      fetchUserRatedBeers
    }
  }
})
</script>

<style scoped>
/* Navbar styling */
.navbar {
  background-color: white;
  padding: 10px 0;
  margin-bottom: 20px;
}

.nav-list {
  list-style-type: none;
  display: flex;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin: 0 20px;
  position: relative;
}

.nav-list li a {
  text-decoration: none;
  color: black;
  font-weight: bold;
  padding: 10px 20px;
  display: block;
  transition: color 0.3s ease;
}

.nav-list li.active a {
  color: black; /* Keep text color consistent */
}

.nav-list li a:hover {
  color: #3498db; /* Hover effect for text */
}

/* Active tab indicator (colored bar under the active tab) */
.nav-list li.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #3498db; /* Color of the indicator bar */
  border-radius: 2px 2px 0 0;
}

/* Content section */
.profile-content {
  margin-top: 20px;
  text-align: center;
}
</style>
