<script lang="ts">
import type { BeerSheet } from '@/models/Beer'
import { defineComponent, ref, onMounted } from 'vue'
import ErrorComponent from '@/components/ErrorComponent.vue' // Import the ErrorComponent

export default defineComponent({
  name: 'BeerList',
  components: {
    ErrorComponent
  },
  setup() {
    const beers = ref<BeerSheet>({
      headers: [],
      data: [],
      styleArray: []
    })
    const loading = ref(true)
    const error = ref<string | null>(null) // Add error state

    const fetchBeers = async () => {
      loading.value = true
      error.value = null // Reset error state
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
        const url = `${backendUrl}/api/sheets/beers-from-sheet`
        console.log(`Fetching data from ${url}`)

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Error fetching beers: ${response.statusText}`)
        }

        const data = await response.json()
        beers.value = data
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
        console.error('Error fetching beer data:', error.value)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchBeers)

    return {
      beers,
      loading,
      error,
      fetchBeers
    }
  }
})
</script>

<template>
  <div class="beer-sheets">
    <div class="beer-list">
      <h1>Beer List</h1>
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">
        <!-- Use the ErrorComponent and pass the error message -->
        <ErrorComponent :errorMessage="error" @retry="fetchBeers" />
      </div>
      <div v-else>
        <div class="stats">
          <div v-for="(styleStats, index) in beers.styleArray" :key="index" class="styleWrapper">
            <h2>{{ styleStats[0] }}: {{ styleStats[1].count }}</h2>

            <div v-if="styleStats[1].topBeer" class="top-beer-info">
              <h3>
                Top beer: {{ styleStats[1].topBeer?.name }} ({{ styleStats[1].topBeer?.rating }})
              </h3>
              <div class="button-group-top">
                <a
                  :href="`https://www.systembolaget.se/sortiment/?q=${encodeURIComponent(styleStats[1].topBeer?.name)}`"
                  class="button button-systembolaget"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Systembolaget
                </a>
                <a
                  :href="`https://untappd.com/search?q=${encodeURIComponent(styleStats[1].topBeer?.name)}`"
                  class="button button-untappd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Untappd
                </a>
                <a
                  :href="`https://www.ratebeer.com/search?beername=${encodeURIComponent(styleStats[1].topBeer?.name)}&tab=beer`"
                  class="button button-ratebeer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ratebeer
                </a>
              </div>
            </div>
            <div v-else>
              <p>No top beer found</p>
            </div>
          </div>
        </div>
        <table class="beer-table">
          <thead>
            <tr>
              <th v-for="header in beers.headers" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, dataIndex) in beers.data" :key="dataIndex">
              <td>
                <span>{{ data[0] }}</span>
                <div class="button-group">
                  <a
                    :href="`https://www.systembolaget.se/sortiment/?q=${encodeURIComponent(data[0])}`"
                    class="button button-systembolaget"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Systembolaget
                  </a>
                  <a
                    :href="`https://untappd.com/search?q=${encodeURIComponent(data[0])}`"
                    class="button button-untappd"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Untappd
                  </a>
                  <a
                    :href="`https://www.ratebeer.com/search?beername=${encodeURIComponent(data[0])}&tab=beer`"
                    class="button button-ratebeer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ratebeer
                  </a>
                </div>
              </td>
              <td v-for="(cell, cellIndex) in data.slice(1)" :key="cellIndex">{{ cell || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* General Styles */
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

h1 {
  text-align: center;
  margin: 20px 0;
  color: #333;
}

h2,
h3 {
  margin: 10px 0;
  color: #555;
  text-align: center;
}

p {
  margin: 10px 0;
  color: #777;
  text-align: center;
}

/* Stats Section */
.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.styleWrapper {
  flex: 1 1 300px;
  background-color: white;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.top-beer-info {
  margin-top: 10px;
}

/* Button Styles */
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 10px;
}

.button-group-top {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.button {
  display: inline-block;
  padding: 8px 12px;
  text-decoration: none;
  color: white;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
}

.button-systembolaget {
  background-color: #004b9b;
}

.button-untappd {
  background-color: #f8a800;
}

.button-ratebeer {
  background-color: #4e4e4e;
}

.button:hover {
  opacity: 0.9;
}

/* Table Styles */
.beer-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-size: 0.9em;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats {
    flex-direction: column;
    align-items: center;
  }

  .styleWrapper {
    width: 90%;
    margin-bottom: 20px;
  }

  .button-group {
    flex-direction: column;
    align-items: center;
  }

  .button {
    width: 100%;
    text-align: center;
    margin-bottom: 5px;
  }

  th,
  td {
    font-size: 0.8em;
  }

  h1 {
    font-size: 1.5em;
  }
}
</style>
