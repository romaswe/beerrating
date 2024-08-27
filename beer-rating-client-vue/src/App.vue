<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from '@/components/Navbar.vue';
import { RouterView } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
  },
});
</script>

<template>
  <div>
    <Navbar siteTitle="Beer Rating" />
    <RouterView />
  </div>


</template>

<style scoped></style>
