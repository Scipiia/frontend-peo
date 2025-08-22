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

        <!-- Список операций -->
        <div class="operations-grid">
          <div
              v-for="op in fullForm.operations"
              :key="op.name"
              class="operation-row"
          >
            <!-- Название операции -->
            <label class="op-label">{{ op.label }}</label>

            <!-- Инпут (в минутах для удобства) -->
            <div class="op-input-wrapper">
              <input
                  :value="op.value"
                  step="0.001"
                  min="0"
                  class="input-minutes"
              />
            </div>
<!--            <p class="">{{ op.minutes }}</p>-->
          </div>

        <button @click="saveNormirovka" :disabled="loading" class="btn-save">
          {{ loading ? 'Сохраняем...' : 'Сохранить нормировку' }}
        </button>
      </div>
    </div>

    <!-- Заглушка -->
    <div v-else-if="!loading && !fullForm" class="placeholder">
      Выберите форму из списка, чтобы посмотреть детали
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

// const getCategoryShort = (cat) => {
//   const map = {
//     window: 'ОК',
//     glyhar: 'ГЛ',
//     loggia: 'ЛД',
//     vitragh: 'ВТ',
//     door: 'ДВ'
//   }
//   return map[cat] || '??'
// }

// Красивые названия категорий
const categoryLabels = {
  window: 'Окна',
  glyhar: 'Глухари',
  loggia: 'Лоджии',
  vitragh: 'Витражи',
  door: 'Двери'
};

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

async function loadForm(templateCode) {
  loading.value = true
  try {
    const res = await fetch(`http://localhost:8080/template?code=${templateCode}`)
    if (!res.ok) throw new Error('Не удалось загрузить форму')
    fullForm.value = await res.json()

    console.log("REEEESSSS", fullForm.value);
  } catch (err) {
    console.error('Ошибка загрузки формы:', err)
  } finally {
    loading.value = false
  }
}

//TODO КОНЕЦ НОВОЙ ЛОГИКИ
</script>

<style scoped>
.operations-grid {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px 16px;
  margin: 20px 0;
  align-items: center;
}

.operation-row {
  display: contents; /* чтобы не ломать grid */
}

.op-label {
  font-size: 14px;
  color: #2c3e50;
  padding: 8px 0;
}

.op-input-wrapper {
  display: flex;
  justify-content: flex-end;
}

.input-minutes {
  width: 100%;
  max-width: 100px;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  text-align: right;
}

.input-minutes:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Адаптивность */
@media (max-width: 600px) {
  .operations-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .op-input-wrapper {
    justify-content: flex-start;
    margin-top: -8px;
  }
}

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

/* Группы форм */
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
  padding: 10px 16px;
  background: #e9ecef;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.template-item:hover {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

/* Полная форма */
.full-form {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.full-form h3 {
  color: #2c3e50;
  margin-top: 0;
}

.form-code {
  color: #6c757d;
  margin-bottom: 16px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
}

.input-number {
  width: 100%;
  max-width: 200px;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
}

.input-number:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn-save {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-save:hover:not(:disabled) {
  background: #0056b3;
}

.btn-save:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.placeholder {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  margin-top: 20px;
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

.template-category {
  background: #e9ecef;
  color: #495057;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: 12px;
  white-space: nowrap;
}

</style>
