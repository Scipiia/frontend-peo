<template>
  <div>
    <h2>Детали коммерческого приложения</h2>

    <div v-if="loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="order">
      <p><strong>Номер заказа:</strong> {{ order.order_num }}</p>

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
                <p><strong>Цвет:</strong> {{ price.color }}</p>
                <p><strong>Площадь:</strong> {{ price.sqr }}</p>
              </div>
            </div>
          </div>
        </div>

      <!-- Кнопка для генерации Excel -->
      <button @click="goBack">Назад</button>
    </div>

    <div v-else>
      <p>Детали заказа не найдены</p>
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


const orderId = route.params.id;


async function fetchOrderDetails() {
  try {
    //const orderId = route.params.id; // Получаем ID заказа из параметров маршрута
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
  router.go(-1);
}

// Получаем данные при монтировании компонента
onMounted(() => {
  fetchOrderDetails();
});


function goToForm(price) {
  router.push({
    name: 'FormPagePeo',
    params: { id: price.plan_id}, // Передаем ID карточки
    query: {
      order_num: order.value.order_num,
      name: price.name_position,
      count: price.count,
      color: price.color,
      customer: order.value.customer,
      sqr: price.sqr,
      image: price.image,
      position: price.position,
    },
  });
}

</script>

<style scoped>
/* Общие стили */
div {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-weight: 500;
  border-bottom: 2px solid #4299e1;
  padding-bottom: 8px;
}

p {
  margin: 8px 0;
  color: #333;
  line-height: 1.5;
}

strong {
  color: #2d3748;
}

/* Состояния загрузки и ошибки */
.loading,
.error,
.no-order {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.loading {
  color: #4a5568;
}

.error {
  background-color: #fee;
  color: #e53e3e;
  border-radius: 8px;
  border: 1px dashed #c92a2a;
}

.no-order {
  color: #777;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

/* Блок "Изделия" */
h1 {
  font-size: 1.5em;
  color: #2d3748;
  margin-top: 30px;
  margin-bottom: 16px;
  padding-left: 20px;
}

.plans-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 20px;
}

.plan-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.plan-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  border-color: #a0aec0;
}

.plan-item img {
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.plan-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  flex: 1;
}

.plan-details p {
  margin: 0;
  font-size: 14px;
  color: #2d3748;
}

/* Кнопка Назад */
button {
  margin-top: 24px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #4299e1;
  background-color: #ebf8ff;
  border: 1px solid #4299e1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
  margin-left: 20px;
}

button:hover {
  background-color: #bee3f8;
  border-color: #3182ce;
  color: #2b6cb0;
}

/* Адаптивность */
@media (max-width: 600px) {
  .plan-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .plan-item img {
    width: 180px;
    height: auto;
  }
}
</style>
