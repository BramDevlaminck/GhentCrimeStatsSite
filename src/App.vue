<script>
import NavBar from "./components/NavBar.vue"
import 'bootstrap/dist/css/bootstrap.min.css'
import "bootstrap"

export default {
  components: {
    NavBar
  }
}
</script>

<template>
  <NavBar/>
  <router-view />
</template>

<script setup>
</script>