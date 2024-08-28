<template>
  <div class="beer-card">
    <h2>{{ beer.name }}</h2>
    <p><strong>Type:</strong> {{ beer.type }}</p>
    <p v-if="beer.brewery"><strong>Brewery:</strong> {{ beer.brewery }}</p>
    <p v-if="beer.abv"><strong>ABV:</strong> {{ beer.abv }}%</p>
    <p v-if="beer.averageRating"><strong>Average Rating:</strong> {{ beer.averageRating }}</p>

    <!-- Button Group for External Services -->
    <div class="button-group">
      <a :href="`https://www.systembolaget.se/sortiment/?q=${encodeURIComponent(beer.name)}`"
        class="button button-systembolaget" target="_blank" rel="noopener noreferrer">
        Systembolaget
      </a>
      <a :href="`https://untappd.com/search?q=${encodeURIComponent(beer.name)}`" class="button button-untappd"
        target="_blank" rel="noopener noreferrer">
        Untappd
      </a>
      <a :href="`https://www.ratebeer.com/search?beername=${encodeURIComponent(beer.name)}&tab=beer`"
        class="button button-ratebeer" target="_blank" rel="noopener noreferrer">
        Ratebeer
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Beer } from '@/models/Beer'

export default defineComponent({
  name: 'BeerCard',
  props: {
    beer: {
      type: Object as PropType<Beer>,
      required: true
    }
  }
})
</script>

<style scoped>
.beer-card {
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.beer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

p {
  margin: 5px 0;
  color: #555;
  text-align: center;
}

.button-group {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.button {
  padding: 8px 12px;
  text-decoration: none;
  color: white;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
  display: inline-block;
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
</style>
