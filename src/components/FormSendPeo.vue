<template>
  <div class="form-container">
    <h2>Форма нормировки — изделие «{{ cardInfo.name }}»</h2>

    <!-- Информация о заказе -->
    <div class="card-info">
      <p><strong>Номер заказа:</strong> {{ cardInfo.order_num }}</p>
      <p><strong>Система профилей:</strong> {{ cardInfo.name }}</p>
      <p><strong>Номер изделия:</strong> {{ cardInfo.position }}</p>
      <p><strong>Количество:</strong> {{ cardInfo.count }}</p>
      <p><strong>Цвет:</strong> {{ cardInfo.color }}</p>
      <p><strong>Заказчик:</strong> {{ cardInfo.customer }}</p>
      <p><strong>Площадь:</strong> {{ cardInfo.sqr }} м²</p>
      <img
          v-if="cardInfo.image"
          :src="`data:image/png;base64,${cardInfo.image}`"
          alt="Изображение заказа"
          class="order-image"
      />
    </div>

    <!-- Флаг: это составная часть -->
    <div class="composite-toggle">
      <label>
        <input type="checkbox" v-model="isComposite" />
        🔧 Это составная часть (например, фурнитура, глухарь)
      </label>
    </div>

    <!-- Выбор родительского изделия (если составное) -->
    <div class="parent-selection" v-if="isComposite">
      <label><strong>Привязать к:</strong></label>
      <select v-model="selectedParentId" class="form-control" required>
        <option value="" disabled>Выберите основное изделие...</option>
        <option
            v-for="parent in availableParents"
            :key="parent.id"
            :value="parent.id"
        >
          {{ parent.name }}
        </option>
      </select>
      <p v-if="availableParents.length === 0" class="text-muted">
        Нет доступных основных изделий. Сначала добавьте основное (дверь, окно и т.п.).
      </p>
      <div class="parent-selection">
        <label class="form-control"><strong>Уточнение для части:</strong></label>
          <input
              v-model="availableCustomText"
              type="text"
              placeholder="например: витраж к двери"
              class="form-custom-text"
          />
      </div>
    </div>

    <!-- Выбор формы нормировки -->
    <div class="forms-section">
      <h4>Выберите тип изделия</h4>
      <div
          v-for="(templates, category) in groupedTemplates"
          :key="category"
          class="category-group"
      >
        <h5 class="category-title">{{ categoryLabels[category] }}</h5>
        <ul class="templates-list">
          <li
              v-for="tpl in templates"
              :key="tpl.code"
              @click="loadForm(tpl)"
              class="template-item"
          >
            {{ tpl.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Форма операций -->
    <div v-if="fullForm" class="full-form">
      <h3>{{ fullForm.name }}</h3>

      <!-- Тип изделия -->
      <div class="part-type-badge">
        Тип: <strong>{{ fullForm.part_type === 'main' ? 'Основное изделие' : 'Составная часть' }}</strong>
        <span v-if="fullForm.parent_product_id">
          (привязано к наряду ID={{ fullForm.parent_product_id }})
        </span>
      </div>

      <!-- Итоговое время -->
      <div class="total-summary">
        <strong>Итого:</strong>
        {{ totalHours }} ч ({{ totalMinutes }} мин)
      </div>

      <!-- Таблица операций -->
      <table class="norm-table">
        <thead>
        <tr>
          <th>Операция</th>
          <th>Норма (ч)</th>
          <th>Кол-во</th>
          <th>Норма (мин)</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="op in fullForm.operations" :key="op.name">
          <td>{{ op.label }}</td>
          <td>
            <input
                v-model.number="op.value"
                type="number"
                step="0.001"
                min="0"
                class="input-small"
            />
          </td>
          <td>
            <input
                v-model.number="op.count"
                type="number"
                step="1"
                min="0"
                class="input-small"
                @input="recalculateValue(op)"
            />
          </td>
          <td class="text-center">{{ op.minutes }}</td>
        </tr>
        </tbody>
      </table>

      <!-- Кнопки управления -->
      <div class="form-actions">
        <button @click="clearForm" class="btn-cancel">Очистить</button>
        <button @click="saveNormirovka" :disabled="loading" class="btn-save">
          {{ loading ? 'Сохраняем...' : '💾 Сохранить нормировку' }}
        </button>
      </div>

      <!-- Кнопка печати после завершения -->
<!--      <div v-if="showPrintButton" class="print-cta">-->
        <p>✅ Все части нормированы!</p>
        <button @click="goToPrint" class="btn-print">
          🖨️ Перейти к печати всех нарядов
        </button>
<!--      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// --- Данные заказа ---
const cardInfo = ref({
  order_num: route.query.order_num || 'Неизвестно',
  name: route.query.name || 'Неизвестно',
  count: parseInt(route.query.count) || 1,
  color: route.query.color || 'Не указан',
  image: route.query.image || '',
  customer: route.query.customer || 'Не указан',
  sqr: route.query.sqr || 0,
  position: route.query.position
});

console.log("CARD", cardInfo);

// --- Управление формой ---
const allTemplates = ref([]);
const fullForm = ref(null);
const loading = ref(false);
const showPrintButton = ref(false);

// --- Составные изделия ---
//const isCompositeText = ref("");
const isComposite = ref(false);
const selectedParentId = ref(null);
const availableParents = ref([]);
const availableCustomText = ref('');
const lastRootId = ref(null); // ← хранит ID последнего основного изделия

console.log("GGGGGGG", availableCustomText);

// --- Список основных изделий в этом заказе ---
watch(isComposite, async (newValue) => {
  if (newValue && cardInfo.value.order_num) {
    try {
      const res = await fetch(`http://localhost:8080/api/orders/order-norm/by-order?order_num=${cardInfo.value.order_num}`);
      if (res.ok) {
        const allItems = await res.json();
        // Оставляем только основные изделия (которые могут быть родителями)
        availableParents.value = allItems.filter(item => item.part_type === 'main');
      } else {
        availableParents.value = [];
      }
    } catch (err) {
      console.error('Ошибка загрузки родителей:', err);
      availableParents.value = [];
    }
  } else {
    selectedParentId.value = null;
  }
});

// --- Категории шаблонов ---
const categoryLabels = {
  window: 'Окна',
  glyhar: 'Глухари',
  loggia: 'Лоджии',
  vitrage: 'Витражи',
  door: 'Двери',
};

const groupedTemplates = computed(() => {
  const groups = {};
  const categories = Object.keys(categoryLabels);
  categories.forEach(cat => {
    groups[cat] = [];
  });

  allTemplates.value?.Forms?.forEach(tpl => {
    const cat = tpl.category?.toLowerCase().trim();
    if (categories.includes(cat)) {
      groups[cat].push(tpl);
    }
  });

  // Удаляем пустые группы
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) delete groups[key];
  });

  return groups;
});

// --- Загрузка шаблонов ---
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8080/all_templates');
    if (!res.ok) throw new Error('Не удалось загрузить шаблоны');
    allTemplates.value = await res.json();
  } catch (err) {
    console.error('Ошибка загрузки шаблонов:', err);
    alert('Не удалось загрузить шаблоны. Проверьте подключение.');
  }
});

// --- Подсчёт времени ---
const totalHours = computed(() => {
  return fullForm.value?.operations?.reduce((sum, op) => {
    return typeof op.value === 'number' ? sum + op.value : sum;
  }, 0).toFixed(3) || '0.000';
});

const totalMinutes = computed(() => {
  return Math.round(parseFloat(totalHours.value) * 60);
});

// --- Пересчёт нормы при изменении количества ---
function recalculateValue(op) {
  if (op.count === 0 || !op.original_value) {
    op.value = 0;
  } else {
    op.value = parseFloat((op.original_value * op.count).toFixed(6));
  }
}

// --- Загрузка формы по шаблону ---
async function loadForm(tpl) {
  loading.value = true;
  try {
    const res = await fetch(`http://localhost:8080/template?code=${tpl.code}`);
    if (!res.ok) throw new Error('Не удалось загрузить форму');
    fullForm.value = await res.json();

    // Устанавливаем тип и категорию
    fullForm.value.type = tpl.category;
    fullForm.value.code = tpl.code;

    // Определяем part_type и parent_product_id
    if (isComposite.value && selectedParentId.value) {
      fullForm.value.part_type = 'sub';
      fullForm.value.parent_product_id = selectedParentId.value;
    } else {
      fullForm.value.part_type = 'main';
      fullForm.value.parent_product_id = null;
    }

    // Инициализируем операции
    fullForm.value.operations.forEach(op => {
      op.count = op.count || 1;
      op.original_value = op.value;
      recalculateValue(op);
    });
  } catch (err) {
    console.error('Ошибка загрузки формы:', err);
    alert('Не удалось загрузить форму. Попробуйте снова.');
  } finally {
    loading.value = false;
  }
}

// --- Сохранение нормировки ---
function saveNormirovka() {
  if (!fullForm.value) {
    alert("Форма не загружена");
    return;
  }

  // 1. Подготавливаем операции
  const operationsToSend = fullForm.value.operations
      .filter(op => typeof op.value === 'number' && op.value > 0)
      .map(op => ({
        operation_name: op.name,
        operation_label: op.label,
        count: parseFloat(op.count),
        value: parseFloat(op.value.toFixed(3)),
        minutes: op.minutes,
      }));

  if (operationsToSend.length === 0) {
    alert("❌ Все операции имеют значение 0");
    return;
  }

  const total = operationsToSend.reduce((sum, op) => sum + op.value, 0);

  // 2. Формируем payload
  const payload = {
    order_num: cardInfo.value.order_num,
    name: cardInfo.value.name,
    template_code: fullForm.value.code,
    count: cardInfo.value.count,
    type: fullForm.value.type,
    part_type: fullForm.value.part_type,
    parent_product_id: fullForm.value.parent_product_id,
    parent_assembly: availableCustomText.value, // (оставляем, если используется)
    total_time: parseFloat(total.toFixed(3)),
    position: parseInt(cardInfo.value.position),
    customer: cardInfo.value.customer,
    operations: operationsToSend,
    status: "in_production",
  };

  console.log("PAYYY", payload);

  // 3. Отправляем
  fetch('http://localhost:8080/api/orders/order-norm/form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
      .then(res => res.json())
      .then(data => {
        if (!data.order_id) {
          alert("Ошибка: не получен ID наряда");
          return;
        }

        console.log("Сохранён наряд с ID:", data.order_id);

        // rootId — это ID основного (main) наряда, к которому всё привязано
        let rootId;

        if (fullForm.value.part_type === 'main') {
          // Если сохраняем ОСНОВНОЕ изделие — оно и есть root
          rootId = data.order_id;
          // Запоминаем его, чтобы последующие части могли к нему привязаться
          lastRootId.value = rootId;
        } else {
          // Если сохраняем СОСТАВНУЮ часть — rootId = последний main
          rootId = lastRootId.value;
          // Если вдруг не установлен — fallback на order_id (на всякий случай)
          if (!rootId) {
            console.warn("lastRootId не установлен, используем текущий ID");
            rootId = data.order_id;
          }
        }

        // 4. Спрашиваем, будем ли добавлять ещё части
        const createMore = confirm(
            `✅ Нормировка "${fullForm.value.name}" сохранена!\n\nХотите добавить ещё одну часть?`
        );
        console.log("ROOOOOTTTTTID", rootId);

        if (createMore) {
          // Остаться в форме — можно добавить ещё часть
          fullForm.value = null;
        } else {
          // Передаём rootId
          const rootId = fullForm.value.part_type === 'main'
              ? data.order_id
              : lastRootId.value || data.order_id;

          // 🔁 Переход на Vue-страницу
          window.location.href = `/api/norm/order-norm/print/${rootId}`;
          showPrintButton.value = true;
        }
      })
      .catch(err => {
        console.error('Ошибка сохранения:', err);
        alert('Не удалось сохранить нормировку');
      });
}

// --- Очистка формы ---
function clearForm() {
  if (confirm("Очистить форму?")) {
    fullForm.value = null;
  }
}

// --- Переход к печати ---
function goToPrint() {
  if (!lastRootId.value) {
    alert("❌ Нет данных для печати. Сначала сохраните основное изделие.");
    return;
  }

  // Переходим на страницу печати сборки
  window.location.href = `/api/norm/order-norm/print/${lastRootId.value}`;
}
</script>

<style scoped>
.form-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 24px;
}

.card-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 24px;
  font-size: 14px;
}

.card-info p {
  margin: 8px 0;
}

.order-image {
  margin-top: 10px;
  max-width: 180px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

/* === Составные изделия === */
.composite-toggle, .parent-selection {
  margin-bottom: 16px;
  padding: 12px;
  background: #e7f3ff;
  border: 1px dashed #007bff;
  border-radius: 8px;
}

.parent-selection select {
  width: 100%;
  padding: 8px;
  margin-top: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.text-muted {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* === Категории шаблонов === */
.forms-section h4 {
  color: #495057;
  margin-bottom: 16px;
}

.category-group {
  margin-bottom: 20px;
}

.category-title {
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #007bff;
  color: #007bff;
  font-size: 16px;
  display: inline-block;
}

.templates-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.template-item {
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.template-item:hover {
  background: #007bff;
  color: white;
}

/* === Форма операций === */
.full-form {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.full-form h3 {
  color: #2c3e50;
  margin-top: 0;
}

.part-type-badge {
  background: #e0f7fa;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  color: #006064;
}

.norm-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}

.norm-table th, .norm-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.norm-table th {
  background: #f2f2f2;
}

.input-small {
  width: 80px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}

.text-center {
  text-align: center;
}

/* === Кнопки === */
.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn-cancel, .btn-save, .btn-print {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-print {
  background: #ffc107;
  color: #212529;
  font-weight: bold;
}

.print-cta {
  margin-top: 20px;
  padding: 16px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  text-align: center;
}

.form-custom-text {
  width: 95%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}
</style>