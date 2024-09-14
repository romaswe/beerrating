<template>
  <!-- Navigation Bar -->
  <nav class="navbar">
    <ul class="nav-list">
      <li :class="{ active: activeTab === 'stats' }" @click="setActiveTab('stats')">
        <a href="#">User Stats</a>
      </li>
      <li :class="{ active: activeTab === 'rated' }" @click="setActiveTab('rated')">
        <a href="#">All Rated Beers</a>
      </li>
      <li :class="{ active: activeTab === 'unrated' }" @click="setActiveTab('unrated')">
        <a href="#">All Unrated Beers</a>
      </li>
    </ul>
  </nav>

  <!-- Content based on the active tab -->
  <div class="profile-content">
    <UserStatsComponent v-if="activeTab === 'stats'" />
    <UserRatedBeersComponent v-if="activeTab === 'rated'" />
    <UserNotRatedBeersComponent v-if="activeTab === 'unrated'" />
  </div>
</template>

<script lang="ts">
import UserNotRatedBeersComponent from '@/components/UserNotRatedBeersComponent.vue'
import UserRatedBeersComponent from '@/components/UserRatedBeersComponent.vue'
import UserStatsComponent from '@/components/UserStatsComponent.vue'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ProfileView',
  components: {
    UserStatsComponent,
    UserRatedBeersComponent,
    UserNotRatedBeersComponent
  },
  setup() {
    // Managing the active tab state
    const activeTab = ref('stats')

    const setActiveTab = (tab: string) => {
      activeTab.value = tab
    }

    return {
      activeTab,
      setActiveTab
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
