<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p>{{ loadingMessage }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingComponent',
  props: {
    loadingMessage: {
      type: String,
      default: 'Loading, please wait...'
    }
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  /* Adjust based on your layout */
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 5px solid #f3f3f3;
  /* Light gray */
  border-top: 5px solid #3498db;
  /* Blue */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

p {
  color: #555;
  font-size: 1rem;
}
</style>
