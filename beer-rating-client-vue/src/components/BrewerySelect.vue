<template>
  <div class="brewery-select">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search for breweries..."
      class="search-input"
    />
    <div v-if="filteredBreweries.length > 0" class="dropdown">
      <label v-for="brewery in filteredBreweries" :key="brewery" class="checkbox-label">
        <input
          type="checkbox"
          :value="brewery"
          v-model="localSelectedBreweries"
          @change="emitSelectedBreweries"
        />
        {{ brewery }}
      </label>
    </div>
    <div v-else>
      <p>No breweries found.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'BrewerySelect',
  props: {
    breweries: {
      type: Array as () => string[],
      required: true
    },
    selectedBreweries: {
      type: Array as () => string[],
      required: true
    }
  },
  setup(props, { emit }) {
    const searchQuery = ref('')

    // Create a local state for selected breweries
    const localSelectedBreweries = ref([...props.selectedBreweries])

    // Filter breweries based on search query
    const filteredBreweries = ref([...props.breweries])

    watch(searchQuery, (newQuery) => {
      filteredBreweries.value = props.breweries.filter((brewery) =>
        brewery.toLowerCase().includes(newQuery.toLowerCase())
      )
    })

    // Watch the parent prop and update the local state when it changes
    watch(
      () => props.selectedBreweries,
      (newSelected) => {
        localSelectedBreweries.value = [...newSelected]
      }
    )

    // Emit the updated selection to the parent component
    const emitSelectedBreweries = () => {
      emit('update-selected-breweries', localSelectedBreweries.value)
    }

    return {
      searchQuery,
      filteredBreweries,
      localSelectedBreweries,
      emitSelectedBreweries
    }
  }
})
</script>

<style scoped>
.brewery-select {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.dropdown {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  box-sizing: border-box;
}

.checkbox-label {
  display: block;
  padding: 5px 10px;
  cursor: pointer;
  width: 100%;
}

.checkbox-label input {
  margin-right: 10px;
}
</style>
