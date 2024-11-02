<template>
  <header class="navbar">
    <div class="navbar-container">
      <nav class="navbar-content">
        <div class="navbar-links">
          <RouterLink class="nav-link" to="/beers">Beers</RouterLink>
          <RouterLink class="nav-link" to="/beer-list">Legacy List</RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BeerSubNavbarComponent',
  props: {
    siteTitle: {
      type: String,
      default: 'My Website' // Default title if not provided
    }
  },
  setup() {}
})
</script>

<style scoped>
header {
  margin: 0;
  padding: 0 1em;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%; /* Ensure the header takes the full screen width */
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
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
  width: 100%;
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
  flex-wrap: wrap; /* Ensure links wrap on smaller screens */
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; /* Allows wrapping */
  width: 100%;
  box-sizing: border-box; /* Prevents the container from overflowing */
}

.navbar-container {
  width: 100%;
  max-width: 100%; /* Ensure the navbar doesn't exceed screen width */
  box-sizing: border-box;
}

/* Media query for smaller screens */
@media (max-width: 720px) {
  .navbar-content {
    flex-direction: column;
    align-items: center;
  }

  .navbar-links {
    margin-top: 10px;
    justify-content: center; /* Center the links on mobile */
    gap: 1rem; /* Slightly reduce gap on smaller screens */
  }

  .user-info {
    margin-left: 0;
    margin-top: 10px;
  }

  /* Reduce padding on mobile */
  nav a {
    padding: 0.8em 0.5em;
  }

  h2 a {
    font-size: 1.2em;
  }
}
</style>
