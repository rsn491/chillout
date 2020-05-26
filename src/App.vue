<template>
  <div id="app">
    <!-- <NavBar/> -->
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
};

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  background-color: #e6e6e6;
  margin: 0;
}
</style>
