<template>
  <div class="assign-workers" v-if="assembly">
    <h2>Назначение работников</h2>

    <!-- Общая информация -->
    <div class="info-grid">
      <div><strong>Заказ:</strong></div>
      <div>{{ assembly.main.order_num }}</div>

      <div><strong>Изделие:</strong></div>
      <div>{{ assembly.main.name }}</div>

      <div><strong>Общее время:</strong></div>
      <div class="total-time">
        {{ totalAssemblyTime.toFixed(3) }} ч ({{ Math.round(totalAssemblyTime * 60) }} мин)
      </div>

      <div><strong>Дата создания:</strong></div>
      <div>{{ formatDate(assembly.main.created_at) }}</div>
    </div>

    <!-- Список всех нарядов в сборке -->
    <div v-for="item in allItems" :key="item.id" class="item-section">
      <h3>{{ getItemTitle(item)  }}</h3>
      <p>
        <strong>Тип:</strong> {{ getTypeLabel(item.type) }}
      </p>

      <div><strong>Общее время:</strong></div>
      <div class="total-time">
          {{ item.total_time.toFixed(3) }} ч ({{ Math.round(item.total_time * 60) }} мин)
      </div>

      <table class="executors-table">
        <thead>
        <tr>
          <th>Операция</th>
          <th>Норма (мин)</th>
          <th>Норма (ч)</th>
          <th style="width: 50%">
            Исполнители
            <div class="executor-headers">
              <span class="header-label">Исполнитель</span>
              <span class="header-label">Факт (мин)</span>
              <span class="header-label">Факт (ч)</span>
            </div>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="op in item.operations" :key="op.operation_name"
            :class="{ 'missing-executor': op.executors.every(ex => !ex.employee_id) }"
        >
          <td>{{ op.operation_label }}</td>
          <td class="text-center">{{ op.minutes }}</td>
          <td class="text-center">{{ op.value.toFixed(3) }}</td>
          <td>
            <!-- Исполнители -->
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
                    :disabled="isExecutorSelected(op.executors, emp.id, executor)"
                >
                  {{ emp.name }}
                </option>
              </select>

              <input
                  v-model.number="executor.actual_minutes"
                  type="number"
                  placeholder="мин"
                  class="input-minutes"
                  min="0"
                  step="0.5"
                  @input="syncValue(executor)"
              />

              <input
                  v-model.number="executor.actual_value"
                  type="number"
                  placeholder="ч"
                  class="input-minutes"
                  min="0"
                  step="0.001"
                  @input="syncMinutes(executor)"
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

            <button type="button" @click="addExecutor(op)" class="btn-add">
              + Добавить исполнителя
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Кнопки -->
    <div class="actions">
      <button @click="goBack" class="btn-cancel">Назад</button>
      <button @click="saveExecutors" :disabled="loading" class="btn-save">
        {{ loading ? 'Сохраняем...' : 'Сохранить назначения' }}
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="loading">Загрузка сборки...</div>
  <div v-else class="error">Не удалось загрузить данные</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Состояние
const assembly = ref(null);       // вся сборка: main + subs
const employees = ref([]);        // список сотрудников
const loading = ref(false);

const isExecutorSelected = (executors, empId, currentExecutor) => {
  return executors.some(ex =>
      ex !== currentExecutor && ex.employee_id === empId
  );
};

// --- Загрузка данных ---
onMounted(async () => {
  const id = route.params.id;
  if (!id) return;

  loading.value = true;

  try {
    // Прямо используем id как rootId — потому что он гарантированно main
    const assemblyRes = await fetch(`http://localhost:8080/api/orders/order-norm/${id}`);
    if (!assemblyRes.ok) throw new Error('Не удалось загрузить сборку');
    const data = await assemblyRes.json();

    const processedItems = data.map(item => ({
      ...item,
      operations: item.operations.map(op => {
        // Если есть assign_workers и это массив — используем его
        const executors = Array.isArray(op.assign_workers) && op.assign_workers.length > 0
            ? op.assign_workers.map(ex => ({
              employee_id: ex.employee_id,
              actual_minutes: ex.actual_minutes,
              actual_value: parseFloat(ex.actual_value.toFixed(3))
            }))
            : [{
              // Иначе — один пустой исполнитель с нормой времени
              employee_id: '',
              actual_minutes: op.minutes,
              actual_value: parseFloat(op.value.toFixed(3))
            }];

        return {
          ...op,
          executors // ← уже массив
        };
      })
    }));


    // Разделяем
    const main = processedItems.find(i => i.part_type === 'main') || processedItems[0];
    const subs = processedItems.filter(i => i.part_type === 'sub');

    assembly.value = { main, subs };
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    alert('Не удалось загрузить данные');
  } finally {
    loading.value = false;
  }

  // Загрузка сотрудников
  try {
    const empRes = await fetch('http://localhost:8080/api/workers/all');
    employees.value = await empRes.json();
  } catch (err) {
    console.error('Ошибка загрузки сотрудников:', err);
  }
});

// --- Все наряды (для итерации) ---
const allItems = computed(() => {
  if (!assembly.value) return [];
  return [assembly.value.main, ...assembly.value.subs];
});

// --- Общее время всей сборки ---
const totalAssemblyTime = computed(() => {
  return allItems.value.reduce((sum, item) => sum + item.total_time, 0);
});

// --- Вспомогательные функции ---
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

const getItemTitle = (item) => {
  if (item.part_type === 'main') return `${item.name}`;
  return `${item.name} (часть изделия)`;
};

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

// --- Синхронизация: минуты ↔ часы ---
const syncValue = (executor) => {
  executor.actual_value = parseFloat((executor.actual_minutes / 60).toFixed(3));
};

const syncMinutes = (executor) => {
  executor.actual_minutes = Math.round(executor.actual_value * 60);
};

// --- Работа с исполнителями ---
const addExecutor = (op) => {
  const currentTotalMinutes = op.executors.reduce((sum, e) => sum + e.actual_minutes, 0);
  const newCount = op.executors.length + 1;

  // Делим ТОЧНО, без округления
  const perPersonMinutes = currentTotalMinutes / newCount;

  op.executors.push({
    employee_id: '',
    actual_minutes: perPersonMinutes,
    actual_value: parseFloat((perPersonMinutes / 60).toFixed(3))
  });

  // Обновляем ВСЕХ исполнителей одинаково
  op.executors.forEach(ex => {
    ex.actual_minutes = parseFloat(perPersonMinutes.toFixed(3));
    ex.actual_value = parseFloat((perPersonMinutes / 60).toFixed(3));
  });
};

const removeExecutor = (op, idx) => {
  if (op.executors.length <= 1) return;
  op.executors.splice(idx, 1);

  const currentTotal = op.executors.reduce((sum, e) => sum + e.actual_minutes, 0);
  const newCount = op.executors.length;
  const effectiveTotal = Math.max(currentTotal, op.minutes);
  const perPerson = Math.max(1, Math.round(effectiveTotal / newCount));

  op.executors.forEach(ex => {
    ex.actual_minutes = perPerson;
    ex.actual_value = parseFloat((perPerson / 60).toFixed(3));
  });
};

// --- Сохранение ---
const saveExecutors = async () => {
  const payload = {
    assignments: [],
    update_status: "assigned",
    root_product_id: assembly.value.main.id,
  };

  const errors = [];

  for (const item of allItems.value) {
    for (const op of item.operations) {

      const validExecutors = op.executors.filter(ex => ex.employee_id);
      if (validExecutors.length === 0) {
        errors.push(`Операция "${op.operation_label}" (${item.name}) — не назначен исполнитель`);
        continue;
      }
      for (const exec of op.executors) {
        if (!exec.employee_id) {
          errors.push(`У операции "${op.operation_label}" (${item.name}) указан исполнитель без ФИО`);
        }
        if (exec.employee_id) {
          payload.assignments.push({
            product_id: item.id,
            operation_name: op.operation_name,
            employee_id: exec.employee_id,
            actual_minutes: exec.actual_minutes || op.minutes,
            actual_value: exec.actual_value || op.value,
            notes: ''
          });
        }
      }
    }
  }

  // Если есть ошибки — не отправляем
  if (errors.length > 0) {
    alert('Не все операции назначены:\n\n' + errors.join('\n'));
    return;
  }

  if (payload.assignments.length === 0) {
    alert('Нет ни одной операции с назначением');
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      //alert('Все исполнители назначены');
      router.push('/norm/orders');
    }
  } catch (err) {
    console.error('Ошибка отправки:', err);
    //alert('Не удалось сохранить');
  }
};

// --- Возврат ---
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.assign-workers {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.info-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 8px 12px;
  margin-bottom: 24px;
  font-size: 14px;
}

.total-time {
  font-weight: bold;
}

.item-section {
  margin-bottom: 32px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

h3 {
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.executors-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
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

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.missing-executor {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.executor-headers {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
  color: #6c757d;
  text-align: right;
}

.header-label {
  flex: 1;
  white-space: nowrap;
}

</style>