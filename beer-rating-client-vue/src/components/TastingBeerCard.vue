<template>
  <div class="beer-card" @click="openModal($event)">
    <h2>{{ beer.name }}</h2>
    <p><strong>Type:</strong> {{ formattedTypes }}</p>
    <!-- Display list of types -->
    <p id="link" v-if="beer.link">
      <strong>Link:</strong>
      <a id="link-no-modal" :href="beer.link" target="_blank" rel="noopener noreferrer">{{
        beer.link
      }}</a>
    </p>
    <p v-if="beer.comment">
      <strong>Comment:</strong>
      {{ beer.comment }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue'
import type { TastingBeer } from '@/models/TastingBeer'

export default defineComponent({
  name: 'TastingBeerCard',
  props: {
    beer: {
      type: Object as PropType<TastingBeer>,
      required: true
    }
  },
  emits: ['open-modal'],
  setup(props, { emit }) {
    const openModal = (event: Event) => {
      if ((event.target as Element).id != 'link-no-modal') {
        emit('open-modal', props.beer)
      }
    }

    // Computed property to format the list of beer types
    const formattedTypes = computed(() => {
      return props.beer.type ? props.beer.type.join(', ') : '' // Join array of types with commas
    })

    return {
      openModal,
      formattedTypes
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
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
</style>
