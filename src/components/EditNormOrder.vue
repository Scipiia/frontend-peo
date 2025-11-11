<!-- EditNormOrder.vue -->
<template>
  <div class="edit-norm-page" v-if="!loading && assembly">
    <h2>Редактирование заказа</h2>
    <p><strong>Заказ:</strong> {{ assembly[0]?.order_num }}</p>

    <!-- Список всех нарядов в сборке -->
    <div v-for="item in assembly" :key="item.id" class="assembly-item">
      <h3>{{ getItemTitle(item) }}</h3>
      <div class="item-info">
        <span><strong>Тип:</strong> {{ item.type_izd }}</span>
        <span><strong>Кол-во:</strong> {{ item.count }}</span>
        <span><strong>Создан:</strong> {{ formatDate(item.created_at) }}</span>
      </div>

      <!-- Таблица операций -->
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
        <tr v-for="op in item.operations" :key="op.operation_name">
          <td>{{ op.operation_label }}</td>
          <td>
            <input
                v-model.number="op.count"
                type="number"
                min="0"
                step="1"
                class="input-small"
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
            />
          </td>
          <td>
            <input
                v-model.number="op.minutes"
                type="number"
                min="0"
                class="input-small"
                @input="syncValue(op)"
            />
          </td>
        </tr>

        <!-- Доп. операции -->
        <tr v-for="extra in item.extraOperations" :key="extra.operation_name">
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
                min="0"
                step="1"
                class="input-small"
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
            />
          </td>
          <td>
            <input
                v-model.number="extra.minutes"
                type="number"
                min="0"
                class="input-small"
            />
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Кнопки -->
    <div class="actions">
      <button @click="goBack" class="btn-cancel">Назад</button>
      <button @click="saveAll" :disabled="loading" class="btn-save">
        {{ loading ? 'Сохраняем...' : 'Сохранить всё' }}
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="loading">Загрузка сборки...</div>
  <div v-else class="error">Не удалось загрузить данные</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Состояние
const assembly = ref([]);
const loading = ref(false);
// --- Загрузка данных ---
onMounted(async () => {
  const id = route.params.id;
  if (!id) {
    //alert("Не указан ID наряда");
    return router.push('/norm/orders/');
  }

  loading.value = true;

  try {
    // Получаем текущий наряд, чтобы найти rootId
    const itemRes = await fetch(`http://localhost:8080/api/orders/order-norm/${id}`);
    if (!itemRes.ok) throw new Error('Наряд не найден');
    const currentItem = await itemRes.json();

    // Определяем rootId
    let rootId;
    if (currentItem.part_type === 'main') {
      rootId = id;
    } else if (currentItem.parent_product_id) {
      rootId = currentItem.parent_product_id;
    } else {
      rootId = id;
    }

    // Загружаем всю сборку
    const assemblyRes = await fetch(`http://localhost:8080/api/orders/order-norm/${rootId}`);
    if (!assemblyRes.ok) throw new Error('Не удалось загрузить сборку');
    const allItems = await assemblyRes.json();

    // Подготовка данных для редактирования
    assembly.value = allItems.map(item => ({
      id: item.id,
      order_num: item.order_num,
      name: item.name,
      count: item.count,
      type: item.type,
      type_izd: item.type_izd,
      part_type: item.part_type,
      parent_product_id: item.parent_product_id,
      created_at: item.created_at,
      operations: item.operations.map(op => ({ ...op })), // копия
      extraOperations: [
        { operation_name: 'dop_rabota_1', operation_label: '', count: 0, value: 0, minutes: 0 },
        { operation_name: 'dop_rabota_2', operation_label: '', count: 0, value: 0, minutes: 0 },
        { operation_name: 'dop_rabota_3', operation_label: '', count: 0, value: 0, minutes: 0 }
      ]
    }));
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    //alert('Не удалось загрузить данные. Проверьте соединение.');
    router.push('/norm/orders/');
  } finally {
    loading.value = false;
  }
});

// --- Вспомогательные функции ---

// Заголовок наряда
const getItemTitle = (item) => {
  if (item.part_type === 'main') return `Основное изделие: ${item.name}`;
  return `Составная часть: ${item.name}`;
};

// Тип → читаемое название
// const getTypeLabel = (type) => {
//   const labels = {
//     window: 'Окно',
//     glyhar: 'Глухарь',
//     door: 'Дверь',
//     loggia: 'Лоджия',
//     vitrage: 'Витраж'
//   };
//   return labels[type] || type;
// };

// Формат даты
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU');
};

// Синхронизация: value → minutes
const syncMinutes = (op) => {
  if (op.value !== undefined) {
    op.minutes = Math.round(op.value * 60);
  }
};

// Синхронизация: minutes → value
const syncValue = (op) => {
  if (op.minutes !== undefined) {
    op.value = parseFloat((op.minutes / 60).toFixed(6));
  }
};

// Синхронизация: extra.value → extra.minutes
const syncExtraMinutes = (extra) => {
  if (extra.value !== undefined) {
    extra.minutes = Math.round(extra.value * 60);
  }
};

// --- Сохранение всех нарядов ---
const saveAll = async () => {
  if (loading.value) return;
  loading.value = true;

  const savePromises = assembly.value.map(async (item) => {
    // Фильтруем доп. операции
    const validExtra = item.extraOperations.filter(
        ex => ex.operation_label.trim() !== ''
    );

    // Считаем итоговое время
    const total = [
      ...item.operations,
      ...validExtra
    ].reduce((sum, op) => sum + op.value, 0);

    const payload = {
      order_num: item.order_num,
      product_name: item.name,
      type: item.type,
      status: "in_production",
      total_time: parseFloat(total.toFixed(3)),
      operations: [
        ...item.operations.map(op => ({
          operation_name: op.operation_name,
          operation_label: op.operation_label,
          count: op.count || 0,
          value: op.value || 0,
          minutes: op.minutes || 0
        })),
        ...validExtra.map(ex => ({
          operation_name: ex.operation_name,
          operation_label: ex.operation_label,
          count: ex.count || 0,
          value: ex.value || 0,
          minutes: ex.minutes || 0
        }))
      ]
    };

    console.log("PAYYY", payload);

    try {
      const res = await fetch(`http://localhost:8080/api/orders/order/norm/update/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });


      return res.ok ? { success: true, id: item.id } : { success: false, id: item.id };
    } catch (err) {
      console.error(`Ошибка при сохранении наряда ${item.id}:`, err);
      return { success: false, id: item.id };
    }
  });

  const results = await Promise.all(savePromises);
  const successCount = results.filter(r => r.success).length;

  // Результат
  if (successCount === results.length) {
    //alert('Все наряды успешно сохранены');
    router.push('/norm/orders/');
  } else if (successCount > 0) {
    console.error(`Сохранено ${successCount} из ${results.length} нарядов. Проверьте данные.`);
    //alert(`Сохранено ${successCount} из ${results.length} нарядов. Проверьте данные.`);
  } else {
    console.error('Не удалось сохранить ни один наряд');
    //alert('Не удалось сохранить ни один наряд');
  }

  loading.value = false;
};

// --- Возврат ---
const goBack = () => {
    router.push('/norm/orders/');
};
</script>

<style scoped>
.edit-norm-page {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.item-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-size: 14px;
  color: #555;
}

.assembly-item {
  margin-bottom: 32px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.assembly-item h3 {
  margin: 0 0 12px 0;
  color: #1a73e8;
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
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

.input-small {
  width: 80px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}

.input-full {
  width: 95%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
  font-weight: bold;
}

.btn-save:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  font-size: 18px;
  padding: 40px;
  color: #555;
}
</style>