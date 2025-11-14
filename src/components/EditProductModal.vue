<script setup>
/* eslint-disable */
import { ref, computed } from 'vue';

const props = defineProps({
  product: Object,
  employees: Array
});

const emit = defineEmits(['close', 'cancel']);

// Локальная копия продукта для редактирования
const localProduct = ref({ ...props.product });

// Список допустимых значений для customer_type
const customerTypeOptions = ['к', 'ч', 'д'];

// список бригад
const brigadeTypeOptions = ['бригада', 'бригада окон, дверей', 'бригада витражей'];

// === Валидация ===
const errors = ref({});

// Проверка обязательных полей (кроме parent_assembly)
const validate = () => {
  errors.value = {};

  const requiredFields = [
    { key: 'type_izd', label: 'Наименование' },
    { key: 'systema', label: 'Система' },
    { key: 'profile', label: 'Профиль' },
    { key: 'sqr', label: 'Площадь' },
    { key: 'brigade', label: 'Бригада' },
    { key: 'norm_money', label: 'Н/руб' },
    { key: 'customer_type', label: 'Направление заказчика' }
  ];

  requiredFields.forEach(field => {
    const value = localProduct.value[field.key];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.value[field.key] = true;
    }
  });

  // Проверка числовых полей на корректность
  if (isNaN(parseFloat(localProduct.value.sqr)) || parseFloat(localProduct.value.sqr) < 0) {
    errors.value.sqr = true;
  }
  if (isNaN(parseFloat(localProduct.value.norm_money)) || parseFloat(localProduct.value.norm_money) < 0) {
    errors.value.norm_money = true;
  }

  return Object.keys(errors.value).length === 0;
};

// === Вычисляем, валидна ли форма ===
const isFormValid = computed(() => {
  return validate();
});

// === Сохранение ===
const save = () => {
  if (validate()) {
    emit('close', localProduct.value);
  }
};

const cancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="modal-overlay" @click="cancel">
    <div class="modal-content" @click.stop>
      <h3>Редактирование изделия</h3>

      <!-- Спецификация (необязательное поле) -->
      <div class="form-group">
        <label>Спецификация</label>
        <input
            v-model="localProduct.parent_assembly"
            class="form-input"
            placeholder="Опционально"
        />
      </div>

      <!-- Наименование -->
      <div class="form-group" :class="{ 'error': errors.type_izd }">
        <label>Наименование</label>
        <input
            v-model="localProduct.type_izd"
            class="form-input"
            :class="{ 'invalid': errors.type_izd }"
            @blur="validate"
        />
        <span v-if="errors.type_izd" class="error-text">Укажите наименование</span>
      </div>

      <!-- Направление заказчика (выбор из 3 вариантов) -->
      <div class="form-group" :class="{ 'error': errors.customer_type }">
        <label>Направление заказчика</label>
        <select
            v-model="localProduct.customer_type"
            class="form-select"
            :class="{ 'invalid': errors.customer_type }"
            @change="validate"
        >
          <option value="" disabled>Выберите значение</option>
          <option v-for="opt in customerTypeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <span v-if="errors.customer_type" class="error-text">Выберите направление</span>
      </div>

      <!-- Система -->
      <div class="form-group" :class="{ 'error': errors.systema }">
        <label>Система</label>
        <input
            v-model="localProduct.systema"
            class="form-input"
            :class="{ 'invalid': errors.systema }"
            @blur="validate"
        />
        <span v-if="errors.systema" class="error-text">Укажите систему</span>
      </div>

      <!-- Профиль -->
      <div class="form-group" :class="{ 'error': errors.profile }">
        <label>Профиль</label>
        <input
            v-model="localProduct.profile"
            class="form-input"
            :class="{ 'invalid': errors.profile }"
            @blur="validate"
        />
        <span v-if="errors.profile" class="error-text">Укажите профиль</span>
      </div>

      <!-- Площадь -->
      <div class="form-group" :class="{ 'error': errors.sqr }">
        <label>Площадь</label>
        <input
            v-model.number="localProduct.sqr"
            type="number"
            step="0.001"
            min="0"
            class="form-input"
            :class="{ 'invalid': errors.sqr }"
            @blur="validate"
        />
        <span v-if="errors.sqr" class="error-text">Введите корректную площадь</span>
      </div>

      <!-- Бригада -->
      <div class="form-group" :class="{ 'error': errors.brigade }">
        <label>Бригада</label>
        <select
            v-model="localProduct.brigade"
            class="form-select"
            :class="{ 'invalid': errors.brigade }"
            @change="validate"
        >
          <option value="" disabled>Выберите значение</option>
          <option v-for="opt in brigadeTypeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <span v-if="errors.brigade" class="error-text">Выберите бригаду</span>
      </div>


      <!-- Н/руб -->
      <div class="form-group" :class="{ 'error': errors.norm_money }">
        <label>Н/руб</label>
        <input
            v-model.number="localProduct.norm_money"
            type="number"
            step="0.01"
            min="0"
            class="form-input"
            :class="{ 'invalid': errors.norm_money }"
            @blur="validate"
        />
        <span v-if="errors.norm_money" class="error-text">Введите норму в рублях</span>
      </div>

      <!-- Кнопки -->
      <div class="modal-actions">
        <button @click="cancel" class="btn-cancel">Отмена</button>
        <button @click="save" class="btn-save" :disabled="!isFormValid">
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

/* Стили для инпутов и селекта */
.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2563eb;
}

/* Ошибка */
.form-input.invalid,
.form-select.invalid {
  border-color: #e53e3e;
  background-color: #fef2f2;
}

.error-text {
  font-size: 12px;
  color: #e53e3e;
  margin-top: 4px;
  display: block;
}

/* Отключенная кнопка */
.btn-save:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  opacity: 0.8;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-cancel:hover {
  background: #cbd5e0;
}

.btn-save {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
}
</style>