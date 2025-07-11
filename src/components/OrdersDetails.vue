<template>
  <div>
    <h2>Order Details</h2>

    <div v-if="loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ order.error }}</p>
    </div>

    <div v-else-if="order">
      <p><strong>ID:</strong> {{ order.id }}</p>
      <p><strong>Order Number:</strong> {{ order.order_num }}</p>
      <p><strong>Customer:</strong> {{ order.customer }}</p>

        <div>
          <h1>Изделия</h1>
          <div class="plans-container">
            <div v-for="(price, index) in order.order_dem_price"
                 :key="index"
                 @click="goToForm(price)"
                 class="plan-item">
              <img :src="`data:image/png;base64,${price.image}`" width="120" alt="Order Image" />

              <div class="plan-details">
                <p><strong>Позиция:</strong> {{ price.position }}</p>
                <p><strong>Название:</strong> {{ price.name_position }}</p>
                <p><strong>Количество:</strong> {{ price.count }}</p>
                <p><strong>Цвет:</strong> {{ price.plan_color }}</p>
              </div>
            </div>
          </div>
        </div>

      <!-- Кнопка для генерации Excel -->
      <button @click="goBack">Назад</button>
      <button @click="generateExcel">Download as Excel</button>
    </div>

    <div v-else>
      <p>Order not found.</p>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

// Получаем параметры маршрута
const route = useRoute();
const router = useRouter();

// Реактивные переменные
const loading = ref(true);
const error = ref(null);
const order = ref(null);


const orderId = route.params.id; // Получаем ID заказа из параметров маршрута
console.log('Order ID from route:', orderId);


async function fetchOrderDetails() {
  try {
    const orderId = route.params.id; // Получаем ID заказа из параметров маршрута
    const response = await axios.get(`http://localhost:8080/api/orders/order/${orderId}`);
    order.value = response.data;
  } catch (err) {
    console.error('Ошибка при получении деталей заказа:', err);
    error.value = 'Не удалось загрузить детали заказа.';
  } finally {
    loading.value = false;
  }
}

// Функция для возврата назад
function goBack() {
  router.go(-1); // Возвращаемся на предыдущую страницу
}

// Получаем данные при монтировании компонента
onMounted(() => {
  fetchOrderDetails();
});

function generateExcel() {
  // Формируем URL для скачивания Excel-файла
  const url = `http://localhost:8080/api/orders/order/generate-excel/${orderId}`;

  // Перенаправляем пользователя на URL
  window.location.href = url;
}

function goToForm(price) {
  router.push({
    name: 'FormPagePeo',
    params: { id: price.plan_id }, // Передаем ID карточки
    query: {
      order_num: order.value.order_num,
      name: price.name_position,
      count: price.count,
      color: price.plan_color,
      image: price.image,
    },
  });
}

// function selectForm(formId) {
//   selectedForm.value = formId;
//   fetchFormConfig(formId);
// }

</script>

<style scoped>

.plans-container {
  display: flex;
  flex-direction: column; /* Каждая запись на новой строке */
  gap: 10px; /* Расстояние между записями */
  align-items: start;
  padding-left: 20px;
}

.plan-item {
  display: flex; /* Изображение и текст в строку */
  align-items: center; /*!* Выравнивание по центру *!*/
  /*flex-direction: initial;*/
  gap: 20px; /* Расстояние между изображением и текстом */
}

.plan-details {
  display: flex;
  flex-direction: column; /* Текстовые элементы в столбик */
  align-items: start;
}
</style>
