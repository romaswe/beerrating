<template>
  <div class="beer-type-card">
    <span class="beer-type-name">{{ beerType.name }}</span>
    <button @click="deleteBeerType" class="delete-button">Delete</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { BeerType } from '@/models/BeerType'

export default defineComponent({
  name: 'BeerTypeCard',
  props: {
    beerType: {
      type: Object as PropType<BeerType>,
      required: true
    }
  },
  emits: ['delete-beer-type'],
  setup(props, { emit }) {
    const deleteBeerType = () => {
      emit('delete-beer-type', props.beerType._id)
    }

    return { deleteBeerType }
  }
})
</script>

<style scoped>
.beer-type-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.beer-type-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.delete-button {
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 8px 16px;
  margin: 0.3rem;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.delete-button:hover {
  background-color: #e74c3c;
  color: #fff;
}
</style>
