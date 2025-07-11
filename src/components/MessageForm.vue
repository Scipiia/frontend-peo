<template>
  <div>
    <h2>Send a Message to the Server</h2>
    <form @submit.prevent="sendMessage">
      <label for="messageInput">Enter your message:</label>
      <input
          type="text"
          id="messageInput"
          v-model="userMessage"
          placeholder="Type your message here"
      />
      <button type="submit">Send</button>
    </form>

    <div v-if="responseMessage" class="response">
      <h3>Response from Server:</h3>
      <p>{{ responseMessage }}</p>
      <p>{{ id }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userMessage: '', // Поле ввода пользователя
      responseMessage: '', // Ответ от сервера
      id: "",
    };
  },
  methods: {
    async sendMessage() {
      try {
        const newMessage = { text: this.userMessage };
        const response = await axios.post('http://localhost:8080/api/message', newMessage);
        this.responseMessage = response.data.text; // Сохраняем ответ сервера
        this.id = response.data.id;
      } catch (error) {
        console.error('Error sending message:', error);
        this.responseMessage = 'Error sending message';
      }
    },
  },
};
</script>

<style scoped>
form {
  margin-bottom: 20px;
}
input {
  padding: 8px;
  margin-right: 10px;
  width: 200px;
}
button {
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #369c6f;
}
.response {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
</style>