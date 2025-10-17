<!-- EditProductModal.vue -->
<script setup>
/* eslint-disable */

const props = defineProps({
  product: Object,
  employees: Array
});

import {ref} from "vue";

const emit = defineEmits(['close', 'cancel']);

// Можно добавить поля для редактирования
const localProduct = ref({ ...props.product });


const save = () => {
  emit('close', localProduct.value); // передаём обновлённые данные
};

const cancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="modal-overlay" @click="cancel">
    <div class="modal-content" @click.stop>
      <h3>Редактирование изделия</h3>

      <div class="form-group">
        <label>Спецификация</label>
        <input v-model="localProduct.parent_assembly" class="form-input" />
      </div>

      <div class="form-group">
        <label>Наименование</label>
        <input v-model="localProduct.type_izd" class="form-input" />
      </div>

      <div class="form-group">
        <label>Направление заказчика</label>
        <input v-model="localProduct.customer_type" class="form-input" />
      </div>

      <div class="form-group">
        <label>Система</label>
        <input v-model="localProduct.systema" class="form-input" />
      </div>

      <div class="form-group">
        <label>Профиль</label>
        <input v-model="localProduct.profile" class="form-input" />
      </div>

      <div class="form-group">
        <label>Площадь</label>
        <input v-model="localProduct.sqr"
               class="form-input"
               type="number"
        />
      </div>

      <div class="form-group">
        <label>Бригада</label>
        <input v-model="localProduct.brigade" class="form-input" />
      </div>

      <div class="form-group">
        <label>Н/руб</label>
        <input v-model="localProduct.norm_money"
               class="form-input"
               type="number"
        />
      </div>

      <div class="modal-actions">
        <button @click="cancel" class="btn-cancel">Отмена</button>
        <button @click="save" class="btn-save">Сохранить</button>
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
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  background: #e2e8f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>