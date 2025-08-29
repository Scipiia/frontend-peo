<!-- NormirovkaPrint.vue -->
<template>
  <div class="norm-print-page" v-if="norm">
    <h1>Нормировочный лист</h1>

    <!-- Информация о заказе -->
    <div class="info-grid">
      <div><strong>Заказ:</strong></div>
      <div>{{ norm.order_num }}</div>

      <div><strong>Изделие:</strong></div>
      <div>{{ norm.name }}</div>

      <div><strong>Количество:</strong></div>
      <div>{{ norm.count }} шт.</div>

      <div><strong>Время нормирования:</strong></div>
      <div>{{ new Date(norm.created_at).toLocaleString() }}</div>

      <div><strong>Итого по изделию:</strong></div>
      <div class="total-time">
        {{ totalHours }} ч ({{ totalMinutes }} мин)
      </div>
    </div>

    <!-- Таблица операций с колонкой "ФИО исполнителя" -->
    <h2>Операции</h2>
    <table class="operations-table">
      <thead>
      <tr>
        <th>Операция</th>
        <th>Кол-во</th>
        <th>Время (ч)</th>
        <th>Время (мин)</th>
        <th>ФИО исполнителя</th>
      </tr>
      </thead>
      <tbody>
      <!-- Основные операции -->
      <tr v-for="op in norm.operations" :key="op.operation_name">
        <td>{{ op.operation_label }}</td>
        <td class="text-center">{{ op.count }}</td>
        <td class="text-right">{{ op.value.toFixed(3) }}</td>
        <td class="text-right">{{ op.minutes }}</td>
        <td class="executor"></td>
      </tr>
      <tr>
        <td colspan="2"><strong>Итого</strong></td>
        <td class="text-right">
          <strong>{{ totalHours }}</strong>
        </td>
        <td class="text-right">
          <strong>{{ totalMinutes }}</strong>
        </td>
      </tr>

      <!-- Пустые строки для доп. работ -->
      <tr v-for="n in 3" :key="'extra-' + n">
        <td class="executor">Доп. работа</td>
        <td class="extra-op"></td>
        <td class="text-center extra-field"></td>
        <td class="text-right extra-field"></td>
        <td class="text-right extra-field"></td>
      </tr>
      </tbody>
    </table>

    <!-- Кнопка печати -->
    <div class="print-actions">
      <button @click="printNormirovka" class="btn-print">
        🖨️ Распечатать
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="loading">
    Загрузка нормировки...
  </div>

  <div v-else class="error">
    Нормировка не найдена
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const norm = ref(null);
const loading = ref(true);

// Загрузка нормировки
onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:8080/api/orders/order/norm/${id}`);
    if (!res.ok) throw new Error('Not found');
    norm.value = await res.json();
  } catch (err) {
    console.error('Ошибка загрузки нормировки:', err);
  } finally {
    loading.value = false;
  }
});

// Итоговое время
const totalHours = computed(() => {
  const sum = norm.value?.operations?.reduce((acc, op) => acc + op.value, 0) || 0;
  return sum.toFixed(3);
});

const totalMinutes = computed(() => {
  return Math.round(parseFloat(totalHours.value) * 60);
});

// Печать
function printNormirovka() {
  window.print();
}
</script>

<style scoped>
.norm-print-page {
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background: #fff;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 28px;
}

h2 {
  color: #2c3e50;
  margin: 30px 0 15px;
  font-size: 20px;
}

/* Сетка информации */
.info-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 8px 12px;
  margin-bottom: 24px;
  font-size: 16px;
}

.info-grid div {
  margin: 4px 0;
}

.total-time {
  font-weight: bold;
  color: #d35400;
}

/* Таблица операций */
.operations-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.operations-table th,
.operations-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.operations-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

/* Колонка "ФИО исполнителя" */
.executor {
  width: 200px;
  min-width: 200px;
  background: #f8f9fa;
  font-style: italic;
  color: #6c757d;
  text-align: center;
}

/* Доп. работы */


.extra-op {
  font-style: italic;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
  font-family: monospace;
}

/* Итог */
.operations-table tfoot td {
  font-weight: bold;
  background: #f8f9fa;
}

/* Кнопка печати */
.print-actions {
  margin-top: 40px;
  text-align: center;
}

.btn-print {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.btn-print:hover {
  background: #0056b3;
}

/* Стили для печати */
@media print {
  body {
    padding: 10px;
  }

  .print-actions {
    display: none;
  }

  .norm-print-page {
    padding: 10px;
    font-size: 12px;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 18px;
  }

  .info-grid {
    font-size: 14px;
  }

  .operations-table {
    font-size: 12px;
  }

  .executor,
  .extra-op,
  .extra-field {
    background: white !important;
    color: black !important;
  }
}

</style>


