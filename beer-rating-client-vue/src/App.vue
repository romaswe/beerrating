<script lang="ts">
import { defineComponent } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { RouterView } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
    Footer,
    RouterView
  }
})
</script>

<template>
  <div>
    <Navbar siteTitle="Beer Rating" />
    <RouterView />
    <Footer />
  </div>
</template>

<style scoped></style>
