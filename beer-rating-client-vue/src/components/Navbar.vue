<template>
  <header class="navbar">
    <div class="navbar-container">
      <nav class="navbar-content">
        <div class="title-and-user">
          <h2>
            <a href="/" class="navbar-title">{{ siteTitle }}</a>
          </h2>
          <!-- Display the user's username and role -->
          <span v-if="isLoggedIn" class="user-info">{{ username }} ({{ userRole }})</span>
        </div>

        <div class="navbar-links">
          <RouterLink class="nav-link" to="/">Home</RouterLink>
          <RouterLink class="nav-link" to="/beer-list">Beer List</RouterLink>
          <RouterLink class="nav-link" to="/beers">Beers</RouterLink>
          <!-- Show more links if the user is logged in -->
          <template v-if="isLoggedIn">
            <!-- Example: Show Admin only if the role is 'admin' -->
            <RouterLink class="nav-link" v-if="userRole === 'admin'" to="/admin">Admin</RouterLink>
            <!-- Add more links based on the user role here -->
            <button @click="logout" class="nav-link logout-button">Logout</button>
          </template>
          <!-- Show login link if the user is not logged in -->
          <template v-else>
            <RouterLink class="nav-link login-button" to="/login">Login</RouterLink>
          </template>
        </div>
        <a href="https://github.com/romaswe" target="_blank" class="navbar-github">
          <span class="sr-only">Go to my GitHub page</span>
          <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
        </a>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { Myconsts } from '@/const'
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'NavbarComponent',
  props: {
    siteTitle: {
      type: String,
      default: 'My Website' // Default title if not provided
    }
  },
  setup() {
    const isLoggedIn = ref(false)
    const userRole = ref('')
    const username = ref('')

    const checkLoginStatus = () => {
      const token = localStorage.getItem(Myconsts.tokenName)
      const role = localStorage.getItem(Myconsts.roleName)
      const user = localStorage.getItem(Myconsts.userName)
      isLoggedIn.value = !!token
      if (role) {
        userRole.value = role
      }
      if (user) {
        username.value = user // Set the username
      }
    }

    const logout = () => {
      localStorage.removeItem(Myconsts.tokenName)
      localStorage.removeItem(Myconsts.roleName)
      localStorage.removeItem(Myconsts.userName)
      isLoggedIn.value = false
      userRole.value = ''
      username.value = ''
      window.location.reload()
    }

    onMounted(checkLoginStatus)

    return {
      isLoggedIn,
      userRole,
      username,
      logout
    }
  }
})
</script>

<style scoped>
header {
  margin: 0;
  padding: 0 1em;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h2 {
  margin: 0;
  font-size: 1em;
}

h2 a,
h2 a.active {
  text-decoration: none;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

nav a {
  padding: 1em 0.5em;
  color: black;
  border-bottom: 4px solid transparent;
  text-decoration: none;
}

.router-link-active {
  text-decoration: none;
  border-bottom-color: #3498db;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.logout-button {
  background: none;
  border: none;
  padding: 1em 0.5em;
  color: red;
  cursor: pointer;
  text-decoration: none;
  font: inherit;
}

.logout-button:hover {
  color: #3498db;
}

.login-button {
  color: green;
}

.user-info {
  color: #555;
  font-weight: bold;
  margin: 0;
}

.title-and-user {
  display: flex;
  /* Use flexbox to align items within the div */
  flex-direction: column;
  /* Stack the items vertically */
  align-items: center;
  /* Center the items horizontally */
  justify-content: center;
  /* Center the items vertically */
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

@media (max-width: 720px) {
  .social-links {
    display: none;
  }

  .navbar-content {
    flex-direction: column;
    align-items: center;
  }

  .navbar-links {
    margin-top: 10px;
  }

  .user-info {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>
