<template>
  <div>
    <h1>Message from Backend:</h1>
    <p>{{ status }}</p>
    <p>{{ error }}</p>
    <p>{{ alias }}</p>
    <!--<p>{{ message }}</p>-->
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      //message: 'Loading...',
      status: "Zagryzka...",
      error: "Zagryzka...",
      alias: "Zagryzka...",
    };
  },
  mounted() {
    axios.get("http://localhost:8080/api/fff")
        .then(response => {
          this.status = response.data.status;
          this.error = response.data.error;
          this.alias = response.data.alias;
        })
        .catch(error => {
          console.error("Error pizdec vsemy", error)
          this.error = "Error loading response";
        });
  },
};
</script>

<style scoped>
p {
  font-size: 1.5em;
  color: #333;
}
</style>