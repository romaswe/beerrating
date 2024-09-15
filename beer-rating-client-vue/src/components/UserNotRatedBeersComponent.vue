<template>
  <h1>All beers you have not rated</h1>
  <div v-for="beer in userRatedBeers.docs" :key="beer._id">
    {{ beer.name }}
  </div>

  <div class="pagination-controls">
    <button @click="goToPage(userRatedBeers.page - 1)" :disabled="!userRatedBeers.hasPrevPage">
      Previous
    </button>
    <span>Page {{ userRatedBeers.page }} of {{ userRatedBeers.totalPages }}</span>
    <button @click="goToPage(userRatedBeers.page + 1)" :disabled="!userRatedBeers.hasNextPage">
      Next
    </button>
  </div>
</template>

<script lang="ts">
import type { BeerModel } from '@/models/Beer'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'UserNotRatedBeersComponent',
  emits: ['changePage'],
  props: {
    userRatedBeers: {
      type: {} as PropType<BeerModel>,
      default: () => []
    }
  },
  methods: {
    goToPage(page: number | null) {
      if (page !== null) {
        this.$emit('changePage', page)
      }
    }
  }
})
</script>
<style scoped></style>
