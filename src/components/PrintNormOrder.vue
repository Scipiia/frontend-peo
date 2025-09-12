<template>
  <div class="print-layout" v-if="assembly">
    <!-- Общая шапка -->
    <div class="header">
      <h1>Сборка: {{ assembly.main.name }}</h1>
      <p><strong>Номер заказа:</strong> {{ assembly.main.order_num }}</p>
      <p><strong>Дата создания:</strong> {{ formatDate(assembly.main.created_at) }}</p>
      <hr />
    </div>

    <!-- Основное изделие -->
    <h2>{{ assembly.main.name }}</h2>
    <p>
      <strong>Тип:</strong> {{ getTypeLabel(assembly.main.type) }} |
      <strong>ID:</strong> {{ assembly.main.id }}
    </p>
    <p><strong>Итого:</strong> {{ assembly.main.total_time.toFixed(3) }} ч</p>

    <table class="operations-table">
        <thead>
        <tr>
          <th width="40%">Операция</th>
          <th width="10%">Итого <br> н/час</th>
          <th width="10%">Итого <br> н/мин</th>
          <th>ФИО исполнителя</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="op in assembly.main.operations" :key="op.operation_name">
          <td>{{ op.operation_label }}</td>
          <td>{{ op.value.toFixed(3) }}</td>
          <td>{{ op.minutes }}</td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td colspan="1" class="text-right"><strong>Итого:</strong></td>
          <td>{{ assembly.main.total_time.toFixed(3) }}</td>
          <td>{{ Math.round(assembly.main.total_time * 60) }}</td>
        </tr>
        </tbody>
      </table>

      <AdditionalOperationsSection />

    <!-- Каждая составная часть — с новой страницы -->
    <div
        v-for="sub in assembly.subs"
        :key="sub.id"
        class="item-page sub-item"
    >
      <h2>{{ sub.name }}</h2>
      <p>
        <strong>ID:</strong> {{ sub.id }} |
        <strong>Привязано к:</strong> {{ sub.parent_product_id }}
      </p>
      <p><strong>Итого:</strong> {{ sub.total_time.toFixed(3) }} ч</p>

      <table class="operations-table">
        <thead>
        <tr>
          <th width="40%">Операция</th>
          <th width="10%">Итого <br> н/час</th>
          <th width="10%">Итого <br> н/мин</th>
          <th>ФИО исполнителя</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="op in sub.operations" :key="op.operation_name">
          <td>{{ op.operation_label }}</td>
          <td>{{ op.value.toFixed(3) }}</td>
          <td>{{ op.minutes }}</td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td colspan="1" class="text-right"><strong>Итого:</strong></td>
          <td>{{ sub.total_time.toFixed(3) }}</td>
          <td>{{ Math.round(assembly.main.total_time * 60) }}</td>
        </tr>
        </tbody>
      </table>

      <AdditionalOperationsSection />
    </div>

    <!-- Кнопка печати -->
    <div class="print-controls">
      <button @click="print" class="btn-print">🖨️ Распечатать</button>
    </div>
  </div>

  <div v-else-if="loading" class="loading">Загрузка сборки...</div>
  <div v-else class="error">Не удалось загрузить данные.</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AdditionalOperationsSection from './AddictionOperation.vue';

const route = useRoute();
const assembly = ref(null);
const loading = ref(true);

// Загрузка данных
onMounted(async () => {
  const id = route.params.id;
  if (!id) {
    alert("Не указан ID");
    return;
  }

  try {
    const itemRes = await fetch(`http://localhost:8080/api/orders/order-norm/${id}`);
    const itemData = await itemRes.json();

    // Так как приходит массив, берём первый элемент
    const item = Array.isArray(itemData) ? itemData[0] : itemData;

    console.log("ITEM", item);

    // Определяем rootId
    let rootId;
    if (item.part_type === 'main') {
      rootId = id;
    } else if (item.parent_product_id) {
      rootId = item.parent_product_id;
    } else {
      rootId = id;
    }

    console.log("ROOOTIDDDD", rootId);

    // Загружаем всю сборку
    const assemblyRes = await fetch(`http://localhost:8080/api/orders/order-norm/${rootId}`);
    if (!assemblyRes.ok) throw new Error('Не удалось загрузить сборку');
    const data = await assemblyRes.json();

    const main = data.find(item => item.part_type === 'main');
    const subs = data.filter(item => item.part_type === 'sub');

    assembly.value = { main, subs };
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
});

// Формат даты
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('ru-RU');
}

function getTypeLabel(type) {
  const labels = {
    window: 'Окно',
    glyhar: 'Глухарь',
    door: 'Дверь',
    loggia: 'Лоджия',
    vitrage: 'Витраж'
  };
  return labels[type] || type;
}

function print() {
  window.print();
}
</script>

<style>
.print-layout {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.header {
  margin-bottom: 40px;
}

/* Каждый наряд — с новой страницы при печати */
.item-page {
  page-break-before: always;
  padding: 20px 0;
}

.item-page:first-child {
  page-break-before: avoid;
}

h1, h2, h3, h4 {
  color: #2c3e50;
}

hr {
  border: 1px solid #ccc;
  margin: 20px 0;
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}

.operations-table th,
.operations-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.operations-table th {
  background-color: #f2f2f2;
  font-weight: 600;
}

.total-row {
  background-color: #f9f9f9;
  font-weight: bold;
}

.text-right {
  text-align: right;
}

.sub-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.print-controls {
  text-align: center;
  margin-top: 40px;
}

.btn-print {
  padding: 12px 24px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-print:hover {
  background: #0056b3;
}

.loading, .error {
  text-align: center;
  font-size: 18px;
  padding: 40px;
}

/* Стили для печати */
@media print {
  .print-controls {
    display: none;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-layout {
    box-shadow: none;
    border: none;
    margin: 0;
    padding: 10px;
  }
}
</style>