<!-- AssignExecutors.vue -->
<template>
  <div class="assign-executors" v-if="norm">
    <h2>Назначение исполнителей</h2>
    <p><strong>Заказ:</strong> {{ norm.order_num }}</p>
    <p><strong>Изделие:</strong> {{ norm.product_name }}</p>

    <h3>Операции</h3>
    <table class="executors-table">
      <thead>
      <tr>
        <th>Операция</th>
        <th>Норма (мин)</th>
        <th>Исполнители</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="op in operations" :key="op.operation_name">
        <td>{{ op.operation_label }}</td>
        <td class="text-center">{{ op.minutes }}</td>
        <td>
          <!-- Список исполнителей -->
          <div
              v-for="(executor, idx) in op.executors"
              :key="idx"
              class="executor-row"
          >
            <select v-model="executor.employee_id" class="select-employee">
              <option value="">— выберите —</option>
              <option
                  v-for="emp in employees"
                  :key="emp.id"
                  :value="emp.id"
              >
                {{ emp.name }} ({{ emp.workshop }})
              </option>
            </select>

            <input
                v-model.number="executor.actual_minutes"
                type="number"
                placeholder="мин"
                class="input-minutes"
                min="0"
                step="0.5"
            />

            <button
                type="button"
                @click="removeExecutor(op, idx)"
                class="btn-remove"
                v-if="op.executors.length > 1"
            >
              ✕
            </button>
          </div>

          <!-- Кнопка: добавить ещё одного исполнителя -->
          <button type="button" @click="addExecutor(op)" class="btn-add">
            + Добавить исполнителя
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Кнопки -->
    <div class="actions">
      <button @click="goBack" class="btn-cancel">Назад</button>
      <button @click="saveExecutors" :disabled="loading" class="btn-save">
        {{ loading ? 'Сохраняем...' : 'Сохранить назначения' }}
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="loading">Загрузка...</div>
  <div v-else class="error">Нормировка не найдена</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Данные
const norm = ref(null);
const operations = ref([]);
const employees = ref([]);
const loading = ref(false);

// Загрузка данных при открытии
onMounted(async () => {
  const id = route.params.id;
  loading.value = true;

  try {
    // Загружаем нормировку (операции)
    const normRes = await fetch(`http://localhost:8080/api/orders/order/norm/13`);
    if (!normRes.ok) throw new Error('Norm not found');
    const normData = await normRes.json();

    norm.value = {
      id: id,
      order_num: normData.order_num,
      product_name: normData.product_name
    };

    // Преобразуем операции
    operations.value = normData.operations.map(op => ({
      operation_name: op.name,
      operation_label: op.label,
      minutes: op.minutes,
      executors: [
        { employee_id: '', actual_minutes: op.minutes } // по умолчанию — один исполнитель, время = норма
      ]
    }));

    // Загружаем сотрудников
    const empRes = await fetch('http://localhost:8080/api/employees');
    employees.value = await empRes.json();
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    alert('Не удалось загрузить данные');
  } finally {
    loading.value = false;
  }
});

// Добавить исполнителя к операции
const addExecutor = (op) => {
  op.executors.push({ employee_id: '', actual_minutes: op.minutes });
};

// Удалить исполнителя
const removeExecutor = (op, idx) => {
  if (op.executors.length > 1) {
    op.executors.splice(idx, 1);
  }
};

// Сохранить назначения
const saveExecutors = async () => {
  const payload = {
    product_id: norm.value.id,
    executors: []
  };

  // Собираем всех исполнителей
  for (const op of operations.value) {
    for (const exec of op.executors) {
      if (exec.employee_id) {
        payload.executors.push({
          operation_name: op.operation_name,
          employee_id: exec.employee_id,
          actual_minutes: exec.actual_minutes || op.minutes, // если не ввели — ставим норму
          notes: ''
        });
      }
    }
  }

  if (payload.executors.length === 0) {
    alert('Выберите хотя бы одного исполнителя');
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/executors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('✅ Исполнители назначены');
      router.push(`/normirovka/${norm.value.id}`); // или на список
    } else {
      const text = await res.text();
      alert('❌ Ошибка: ' + text);
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Не удалось отправить');
  }
};

// Возврат
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.assign-executors {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2, h3 {
  color: #2c3e50;
}

.executors-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.executors-table th,
.executors-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.executors-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.text-center {
  text-align: center;
}

/* Строка исполнителя */
.executor-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  align-items: center;
}

.select-employee {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.input-minutes {
  width: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: right;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
}

.btn-add {
  margin-top: 4px;
  padding: 6px 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-add:hover {
  background: #218838;
}

/* Кнопки внизу */
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

.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}
</style>