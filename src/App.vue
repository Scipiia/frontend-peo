<template>
  <div id="app">
    <nav id="hyi" class="no-print">
<!--      <router-link to="/app/fff">Home</router-link> |-->
      <router-link to="/api/message">Form</router-link> |
<!--      <router-link to="/app/send_form">OrderS</router-link> |-->
      <router-link to="/api/orders">Orders</router-link> |
      <router-link to="/api/norm/orders/">Norm Orders</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  background-color: #42b983;
}

#hyi {
  background-color: red;
}
@media print {
  .no-print {
    display: none !important;
  }
}

</style>
