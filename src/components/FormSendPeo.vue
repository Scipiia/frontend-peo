<template>
  <div class="form-container">
    <h2>Форма для изделия «{{ cardInfo.name }}»</h2>

    <!-- Информация о карточке -->
    <div class="card-info">
      <p><strong>Номер заказа:</strong> {{ cardInfo.order_num }}</p>
      <p><strong>Название:</strong> {{ cardInfo.name }}</p>
      <p><strong>Количество:</strong> {{ cardInfo.count }}</p>
      <p><strong>Цвет:</strong> {{ cardInfo.color }}</p>
      <p><strong>Заказчик:</strong> {{ cardInfo.customer }}</p>
      <img
          v-if="cardInfo.image"
          :src="`data:image/png;base64,${cardInfo.image}`"
          width="180"
          alt="Order Image"
      />
    </div>

    <!-- Список форм по группам -->
    <div class="forms-by-category">
      <h4>Выберите форму нормирования</h4>

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
              @click="loadForm(tpl.code)"
              class="template-item"
          >
            <span class="template-name">{{ tpl.name }}</span>
<!--            <span class="template-category">{{ getCategoryShort(tpl.category) }}</span>-->
          </li>
        </ul>
      </div>
    </div>

    <!-- Полная форма -->
    <div v-if="fullForm" class="full-form">
      <h3>{{ fullForm.name }}</h3>

      <!-- После таблицы -->
      <div v-if="fullForm" class="total-summary">
        <strong>Итоговое время по изделию:</strong>
        {{ totalHours }} ч ({{ totalMinutes }} мин)
      </div>

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
          <!-- 1. Название операции -->
          <td>{{ op.label }}</td>

          <!-- 2. Норма в часах (редактируемое) -->
          <td>
            <input
                v-model.number="op.value"
                type="number"
                step="0.001"
                min="0"
                class="input-small"
            />
          </td>

          <!-- 3. Количество (редактируемое) -->
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

          <!-- 4. Норма в минутах (только для чтения) -->
          <td class="text-center">
            {{ op.minutes }}
          </td>
        </tr>
        </tbody>
      </table>

      <button @click="saveNormirovka" :disabled="loading" class="btn-save">
        {{ loading ? 'Сохраняем...' : 'Сохранить нормировку' }}
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

// Данные карточки (можно загрузить с сервера или передать через query/state)
const cardInfo = ref({
  order_num: route.query.order_num || 'Неизвестно',
  name: route.query.name || 'Неизвестно',
  count: route.query.count || 0,
  color: route.query.color || 'Неизвестно',
  image: route.query.image || '',
  customer: route.query.customer || '',
});

// Все шаблоны
const allTemplates = ref([]);
const fullForm = ref(null);
const loading = ref(false);


onMounted(async () => {
  const res = await fetch('http://localhost:8080/all_templates')
  allTemplates.value = await res.json()

  console.log("ALLLLLL", allTemplates);
})

// Красивые названия категорий
const categoryLabels = {
  window: 'Окна',
  glyhar: 'Глухари',
  loggia: 'Лоджии',
  vitragh: 'Витражи',
  door: 'Двери'
};

// Итог: сумма всех (value * count)
const totalHours = computed(() => {
  // Защита: если нет формы или операций — возвращаем 0
  if (!fullForm.value || !Array.isArray(fullForm.value.operations)) {
    return '0.000';
  }

  // Суммируем только корректные числа
  const total = fullForm.value.operations.reduce((sum, op) => {
    const value = op.value;
    // Проверяем, что value — число и не NaN
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      return sum + value;
    }
    return sum; // если не число — игнорируем
  }, 0);

  // Убеждаемся, что total — число, и форматируем
  return parseFloat(total).toFixed(3);
});

const totalMinutes = computed(() => {
  const hours = parseFloat(totalHours.value);
  if (isNaN(hours)) return 0;
  return Math.round(hours * 60);
});


const groupedTemplates = computed(() => {
  const groups = {};

  // Инициализируем только нужные категории
  ['window', 'glyhar', 'loggia', 'vitrage', 'door'].forEach(cat => {
    groups[cat] = [];
  });

  allTemplates.value?.Template?.forEach(tpl => {
    const cat = tpl.category?.toLowerCase().trim();
    if (groups[cat] !== undefined) {
      groups[cat].push(tpl);
    }
  });

  // Удаляем пустые группы
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
});

function recalculateValue(op) {
  if (op.count === 0) {
    op.value = 0;
  } else {
    op.value = parseFloat((op.original_value * op.count).toFixed(3));
  }
}

async function loadForm(templateCode) {
  loading.value = true
  try {
    const res = await fetch(`http://localhost:8080/template?code=${templateCode}`)
    if (!res.ok) throw new Error('Не удалось загрузить форму')
    fullForm.value = await res.json()

    fullForm.value.operations.forEach(op => {
      // Установка count по умолчанию (если не задан)
      if (op.count == null || op.count === undefined) {
        op.count = 1;
      }

      // Сохраняем оригинальную норму на 1 штуку
      op.original_value = op.value;

      // Применяем логику пересчёта
      recalculateValue(op);
    });

    console.log("REEEESSSS", fullForm.value);
  } catch (err) {
    console.error('Ошибка загрузки формы:', err)
  } finally {
    loading.value = false
  }
}

function saveNormirovka() {
  // Защита: форма не загружена
  if (!fullForm.value) {
    console.warn("Форма не загружена");
    return;
  }

  // Фильтруем операции: только те, где value > 0
  const operationsToSend = fullForm.value.operations
      .filter(op => {
        // Пропускаем, если value == 0 или не число
        const isValidValue = typeof op.value === 'number' && op.value > 0;
        return isValidValue;
      })
      .map(op => ({
        name: op.name,
        label: op.label,
        count: op.count || 1,
        value: parseFloat(op.value.toFixed(6)),
        minutes: op.minutes
      }));

  // Проверка: а вдруг всё отфильтровалось?
  if (operationsToSend.length === 0) {
    alert("❌ Все операции имеют значение 0 — ничего не сохранено.");
    return;
  }

  // Итоговое время — сумма только отправляемых операций
  const totalHours = operationsToSend.reduce((sum, op) => sum + op.value, 0);

  // Финальный payload
  const payload = {
    order_num: cardInfo.value.order_num,
    name: cardInfo.value.name,
    template_code: fullForm.value.code,
    count: parseInt(cardInfo.value.count),
    total_time: parseFloat(totalHours.toFixed(3)),
    operations: operationsToSend
  };

  console.log('📤 Отправляем (без нулей):', JSON.stringify(payload, null, 2));

  // Отправка на бэкенд
  fetch('http://localhost:8080/api/orders/order-norm/form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
      .then(res => {
        if (res.ok) {
          alert('✅ Нормировка сохранена');
        } else {
          res.text().then(text => {
            console.error('Ошибка:', text);
            alert('❌ Ошибка сохранения: ' + text);
          });
        }
      })
      .catch(err => {
        console.error('Network error:', err);
        alert('⚠️ Не удалось отправить данные');
      });
}

//TODO КОНЕЦ НОВОЙ ЛОГИКИ
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

.card-info img {
  margin-top: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

/* === Список форм по категориям === */
.forms-by-category h4 {
  color: #495057;
  margin-bottom: 16px;
  font-size: 18px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.template-item:hover {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.template-item:hover .template-category {
  background: rgba(255, 255, 255, 0.3);
}

.template-name {
  font-weight: 500;
  flex: 1;
}

/* === Форма операций === */
.full-form {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.full-form td {
  padding-top: 15px;
}

.full-form h3 {
  color: #2c3e50;
  margin-top: 0;
}

</style>
