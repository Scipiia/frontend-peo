<!-- EditNormOrder.vue -->
<template>
  <div class="edit-norm-page" v-if="norm">
    <h2>Редактирование нормировки</h2>

    <!-- Информация о заказе -->
    <div class="info-grid">
      <div><strong>Заказ:</strong></div>
      <div>{{ norm.order_num }}</div>

      <div><strong>Изделие:</strong></div>
      <div>{{ norm.name }}</div>

      <div><strong>Количество:</strong></div>
      <div>{{ norm.count }}</div>

      <div><strong>Тип:</strong></div>
      <div>{{ getTypeLabel(norm.type) }}</div>

      <div><strong>Время создания:</strong></div>
      <div>{{ new Date(norm.created_at).toLocaleString() }}</div>

      <div><strong>Общее время:</strong></div>
      <div class="total-time">{{ totalHours }} ч</div>
    </div>

    <!-- Таблица операций -->
    <h3>Операции</h3>
    <table class="operations-table">
      <thead>
      <tr>
        <th>Операция</th>
        <th>Кол-во</th>
        <th>Время (ч)</th>
        <th>Время (мин)</th>
      </tr>
      </thead>
      <tbody>
      <!-- Основные операции -->
      <tr v-for="op in operations" :key="op.operation_name">
        <td>{{ op.operation_label }}</td>
        <td>
          <input
              v-model.number="op.count"
              type="number"
              min="1"
              step="1"
              class="input-small"
              @blur = "handleBlur(op)"
          />
        </td>
        <td>
          <input
              v-model.number="op.value"
              type="number"
              step="0.001"
              min="0"
              class="input-small"
              @input="syncMinutes(op)"
              @blur = "handleBlur(op)"
          />
        </td>
        <td class="text-right">
          <input
              v-model.number="op.minutes"
              type="number"
              step="0.001"
              min="0"
              class="input-small"
              @blur = "handleBlur(op)"
          />
        </td>
      </tr>

      <!-- Доп. операции -->
      <tr v-for="(extra) in extraOperations" :key="extra.operation_name">
        <td>
          <input
              v-model="extra.operation_label"
              type="text"
              placeholder="Название доп. операции"
              class="input-full"
          />
        </td>
        <td>
          <input
              v-model.number="extra.count"
              type="number"
              min="1"
              step="1"
              class="input-small"
              @input="recalculateTotal"
              @blur = "handleBlurExtra(extra)"
          />
        </td>
        <td>
          <input
              v-model.number="extra.value"
              type="number"
              step="0.001"
              min="0"
              class="input-small"
              @input="syncExtraMinutes(extra)"
              @blur = "handleBlurExtra(extra)"
          />
        </td>
        <td>
          <input
              v-model.number="extra.minutes"
              type="number"
              min="0"
              class="input-small"
              @blur = "handleBlurExtra(extra)"
          />
        </td>
      </tr>
      </tbody>
      <tfoot>
      <tr>
        <td colspan="2"><strong>Итого</strong></td>
        <td class="text-right">
          <strong>{{ totalHours }}</strong>
        </td>
        <td class="text-right">
          <strong>{{ totalMinutes }}</strong>
        </td>
      </tr>
      </tfoot>
    </table>

    <!-- Кнопки -->
    <div class="actions">
      <button @click="goBack" class="btn-cancel">Назад</button>
      <button @click="saveChanges" :disabled="loading" class="btn-save">
        {{ loading ? 'Сохраняем...' : 'Сохранить' }}
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="loading">Загрузка...</div>
  <div v-else class="error">Нормировка не найдена</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const norm = ref(null);
const operations = ref([]);
const extraOperations = ref([
  { operation_name: 'dop_rabota_1' ,operation_label: '', count: 0, value: 0, minutes: 0 },
  { operation_name: 'dop_rabota_2', operation_label: '', count: 0, value: 0, minutes: 0 },
  { operation_name: 'dop_rabota_3', operation_label: '', count: 0, value: 0, minutes: 0 }
]);
const loading = ref(false);

// Загрузка данных
onMounted(async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`http://localhost:8080/api/orders/order/norm/${id}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();

    console.log(data)
    norm.value = {
      id: id,
      order_num: data.order_num,
      name: data.name,
      count: data.count,
      type: data.type,
      created_at: data.created_at
    };

    operations.value = data.operations.map(op => ({
      operation_name: op.operation_name,
      operation_label: op.operation_label,
      count: op.count,
      value: op.value,
      minutes: op.minutes
    }));
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  }
});

// Синхронизация: value ↔ minutes (для основных операций)
const syncMinutes = (op) => {
  if (op.value !== undefined) {
    op.minutes = Math.round(op.value * 60);
  }
};

//Синхронизация: minutes → value (для доп. операций)
// const syncExtraValue = (extra) => {
//   if (extra.minutes !== undefined) {
//     extra.value = parseFloat((extra.minutes / 60).toFixed(6));
//   }
// };

// Синхронизация: value → minutes (для доп. операций)
const syncExtraMinutes = (extra) => {
  if (extra.value !== undefined) {
    extra.minutes = Math.round(extra.value * 60);
  }
};

const handleBlur = (op) => {
  if (op.count === '' || isNaN(op.count)) {
    op.count = 0;
  }

  if (op.value === '' || isNaN(op.value)) {
    op.value = 0;
  }

  if (op.minutes === '' || isNaN(op.minutes)) {
    op.minutes = 0;
  }
};

const handleBlurExtra = (extra) => {
  if (extra.count === '' || isNaN(extra.count)) {
    extra.count = 0;
  }

  if (extra.value === '' || isNaN(extra.value)) {
    extra.value = 0;
  }

  if (extra.minutes === '' || isNaN(extra.minutes)) {
    extra.minutes = 0;
  }
};

// Пересчёт итога
const totalHours = computed(() => {
  const mainSum = operations.value.reduce((acc, op) => acc + op.value, 0)
  const extraSum = extraOperations.value
      .filter(ex => ex.operation_label.trim() !== '')
      .reduce((acc, ex) => acc + ex.value, 0);
  if (typeof mainSum === "number" && typeof extraSum === "number") {
    return parseFloat((mainSum + extraSum).toFixed(3));
  } else {
    console.warn('mainSum или extraSum не число:', mainSum, extraSum);
    const safeMain = Number(mainSum) || 0;
    const safeExtra = Number(extraSum) || 0;
    return (safeMain + safeExtra).toFixed(2);
  }
});

const totalMinutes = computed(() => {
  return Math.round(totalHours.value * 60);
});

// Сохранение
const saveChanges = async () => {
  const validExtraOps = extraOperations.value.filter(
      ex => ex.operation_label.trim() !== '' && (ex.value > 0 || ex.minutes > 0)
  );

  const payload = {
    order_num: norm.value.order_num,
    product_name: norm.value.name,
    type: norm.value.type,
    total_time: totalHours.value,
    operations: [
      // Основные операции
      ...operations.value.map(op => ({
        operation_name: op.operation_name,
        operation_label: op.operation_label,
        count: op.count || 0,
        value: op.value || 0,
        minutes: op.minutes || 0
      })),
      // Доп. операции
      ...validExtraOps.map(ex => ({
        //operation_name: slugify(ex.operation_label), // например, "dop_rabota_1"
        operation_name: ex.operation_name, // например, "dop_rabota_1"
        operation_label: ex.operation_label,
        count: ex.count,
        value: ex.value,
        minutes: ex.minutes
      }))
    ]
  };

  console.log("PPPPPPAAAU", payload);

  try {
    const res = await fetch(`http://localhost:8080/api/orders/order/norm/update/${norm.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('✅ Сохранено');
      router.push('/orders');
    } else {
      alert('❌ Ошибка сохранения');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Не удалось сохранить');
  }
};

// Возврат
const goBack = () => {
  router.back();
};

// Отображение типа
const getTypeLabel = (type) => {
  const labels = {
    window: 'Окно',
    glyhar: 'Глухарь',
    door: 'Дверь',
    loggia: 'Лоджия',
    vitrage: 'Витраж'
  };
  return labels[type] || type;
};
</script>

<style scoped>
.edit-norm-page {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.info-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 8px 12px;
  margin-bottom: 24px;
}

.total-time {
  font-weight: bold;
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.operations-table th,
.operations-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.operations-table th {
  background: #f8f9fa;
}

.input-small {
  max-width: 100px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-full {
  width: 95%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.text-right {
  text-align: right;
}

.actions {
  margin-top: 30px;
  text-align: right;
}

.btn-cancel {
  padding: 10px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;
}

.btn-save {
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save:disabled {
  background: #6c757d;
}
</style>