<template>
  <div class="tasting-card" @click="openModal">
    <h2>{{ tasting.name }}</h2>
    <p v-if="tasting.description"><strong>Description:</strong> {{ tasting.description }}</p>
    <p v-if="tasting.beers?.length"><strong>Beers:</strong> {{ tasting.beers?.length }}</p>
    <p v-if="tasting.averageBeerRating">
      <strong>Average Beer Rating:</strong> {{ tasting.averageBeerRating }}
    </p>
  </div>
</template>

<script lang="ts">
import type { Tasting } from '@/models/tastings'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'TastingCard',
  props: {
    tasting: {
      type: Object as PropType<Tasting>,
      required: true
    }
  },
  emits: ['open-modal'],
  setup(props, { emit }) {
    const openModal = () => {
      emit('open-modal', props.tasting)
    }

    return {
      openModal
    }
  }
})
</script>

<style scoped>
.tasting-card {
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

.tasting-card:hover {
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
