<template>
  <div class="orders-page">
    <h1>Заказы</h1>

    <!-- Фильтры -->
    <div class="filters">
      <div>
        <label>Год:</label>
        <input v-model.number="year" type="number" min="2020" max="2030" />
      </div>

      <div>
        <label>Месяц:</label>
        <select v-model="month">
          <option v-for="(name, index) in months" :key="index + 1" :value="index + 1">
            {{ name }}
          </option>
        </select>
      </div>

      <div>
        <label>Поиск:</label>
        <input v-model="search" placeholder="Поиск по номеру..." />
      </div>

      <div>
        <label>Сортировка:</label>
        <select v-model="sortBy">
          <option value="id">По ID</option>
          <option value="order_num">По номеру</option>
          <option value="customer">По клиенту</option>
          <option value="created_at">По дате</option>
        </select>
        <select v-model="sortDir">
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>
    </div>

<!--     Кнопки -->
    <div class="actions">
      <button @click="generateExcel">Скачать Excel</button>
    </div>

    <!-- Таблица -->
    <div v-if="orders && orders.length > 0" class="table-container">
      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>Номер</th>
          <th>Клиент</th>
          <th>Создал</th>
          <th>Примечание</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="order in orders"
            :key="order.id"
            @click="viewOrderDetails(order.id)"
            style="cursor: pointer;"
        >
          <td>{{ order.id }}</td>
          <td>{{ order.order_num }}</td>
          <td>{{ order.customer }}</td>
          <td>{{ order.creator }}</td>
          <td>{{ order.ms_note }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-else class="no-orders">Заказы не найдены</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from "axios";
import { useRouter } from 'vue-router';

const router = useRouter();
const orders = ref([]);
const errorMessage = ref('');

// Фильтры
const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth() + 1);
const search = ref(''); // для поиска по order_num
const sortBy = ref('id'); // сортировка
const sortDir = ref('desc'); // направление

// Список месяцев
const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Автоматическая загрузка при открытии
onMounted(() => {
  fetchOrders();
});

// Функция получения заказов
async function fetchOrders() {
  try {
    orders.value = [];
    errorMessage.value = '';

    const response = await axios.get('http://localhost:8080/api/orders', {
      params: {
        year: year.value,
        month: month.value,
        search: search.value,
        sortBy: sortBy.value,
        sortDir: sortDir.value
      }
    });

    if (response.data.error) {
      errorMessage.value = response.data.error;
    } else {
      orders.value = response.data.orders;
    }
  } catch (error) {
    errorMessage.value = 'Не удалось загрузить заказы.';
    console.error(error);
  }
}

// При изменении любого фильтра — обновляем
watch([year, month, search, sortBy, sortDir], () => {
  fetchOrders();
});

// Функция для скачивания Excel
function generateExcel() {
  const url = `http://localhost:8080/api/generate-excel?year=${year.value}&month=${month.value}&search=${search.value}`;
  window.location.href = url;
}

// Переход к деталям
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