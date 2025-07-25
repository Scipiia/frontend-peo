<template>
  <div id="app">
    <nav id="hyi">
      <router-link to="/app/fff">Home</router-link> |
      <router-link to="/api/message">Form</router-link> |
<!--      <router-link to="/app/send_form">OrderS</router-link> |-->
      <router-link to="/api/orders">Orders</router-link>
<!--      <router-link to="/app/orders/order">Orders</router-link>-->
    </nav>
    <hr />
    <router-view></router-view>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import MessageForm from "@/components/MessageForm.vue";
//import OrdersDetails from "@/components/OrdersDetails.vue";

export default {
  name: 'App',
  //components: {OrdersDetails},
  // components: {
  //   HelloWorld,
  //   MessageForm,
  // }
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

</style>
