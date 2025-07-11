<template>
  <div>
    <!-- Форма для выбора даты -->
    <form @submit.prevent="fetchOrders">
      <label for="year">Год:</label>
      <input type="number" id="year" v-model="year" required />

      <label for="month">Месяц:</label>
      <input type="number" id="month" v-model="month" min="1" max="12" required />

      <button type="submit">Получить заказы</button>

      <button @click="generateExcel">Download as Excel</button>
    </form>

    <div v-if="orders && orders.length > 0">
      <h2>Заказы:</h2>
      <table>
        <!-- Заголовки таблицы -->
        <thead>
        <tr>
          <th>ID</th>
          <th>OrderNum</th>
          <th>Creator</th>
          <th>Customer</th>
          <th>Dop Info</th>
          <th>MS_DJ_vanvan</th>
        </tr>
        </thead>
        <!-- Данные заказов -->
        <tbody>
        <tr
            v-for="order in orders"
            :key="order.id"
            @click="viewOrderDetails(order.id)"
            style="cursor: pointer;"
        >
          <td>{{ order.id }}</td>
          <td>{{ order.order_num }}</td>
          <td>{{ order.creator }}</td>
          <td>{{ order.customer }}</td>
          <td>{{ order.dop_info }}</td>
          <td>{{ order.ms_note }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Сообщение об отсутствии заказов -->
    <div v-else-if="errorMessage">{{ errorMessage }}</div>
    <div v-else>Заказы не найдены.</div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // Импортируем useRouter

// Реактивные переменные
const year = ref(new Date().getFullYear()); // Текущий год по умолчанию
const month = ref(new Date().getMonth() + 1); // Текущий месяц по умолчанию
const orders = ref([]);
const errorMessage = ref('');
// Инициализируем роутер
const router = useRouter();

// Функция для получения заказов
async function fetchOrders() {
  try {
    // Очищаем предыдущие данные
    orders.value = [];
    errorMessage.value = '';
    console.log(year, month);

    // Отправляем GET-запрос на сервер
    const response = await axios.get('http://localhost:8080/api/orders', {
      params: {
        year: year.value,
        month: month.value,
      },
    });

    // Проверяем ответ
    console.log('Ответ сервера:', response.data);
    if (response.data.error) {
      errorMessage.value = response.data.error;
    } else {
      orders.value = response.data.orders;
    }
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    errorMessage.value = 'Не удалось получить заказы. Попробуйте позже.';
  }
}

// Функция для скачивания Excel
function generateExcel() {
  // Формируем URL для скачивания Excel-файла
  const url = `http://localhost:8080/api/generate-excel?year=${year.value}&month=${month.value}`;

  // Перенаправляем пользователя на URL
  window.location.href = url;
}

// Функция для перехода к деталям заказа
function viewOrderDetails(orderId) {
  router.push({ name: 'OrdersDetails', params: { id: orderId } });
}


</script>

<style scoped>
form {
  margin-bottom: 20px;
}
label {
  margin-right: 10px;
}
input {
  margin-right: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
</style>