<template>
  <div class="error-container">
    <h2>Error</h2>
    <p>{{ errorMessage }}</p>
    <button @click="retry" class="retry-button">Retry</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorComponent',
  props: {
    errorMessage: {
      type: String,
      default: 'An error occurred while fetching data. Please try again.'
    }
  },
  emits: ['retry'],
  setup(_, { emit }) {
    const retry = () => {
      emit('retry')
    }

    return { retry }
  }
})
</script>

<style scoped>
.error-container {
  text-align: center;
  background-color: #ffdddd;
  border: 1px solid #ff0000;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.retry-button {
  background-color: #ff0000;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-button:hover {
  background-color: #cc0000;
}
</style>
