<template>
  <div id="app">
    <NavBar></NavBar>
    <b-container fluid>
      <router-view />
    </b-container>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';

export default {
  metaInfo: {
    title: 'App',
    titleTemplate: '%s | Frontend',
    meta: []
  },
  components: {
    NavBar,
  },

};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

@import 'assets/css/custom.css';
</style>
