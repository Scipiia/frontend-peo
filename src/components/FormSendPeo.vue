<template>
  <div>
    <h2>Форма для изделия {{ cardInfo.name }}</h2>

    <!-- Информация о карточке -->
    <div class="card-info">
      <p><strong>Номер заказа:</strong> {{cardInfo.order_num}} </p>
      <p><strong>Название:</strong> {{ cardInfo.name }}</p>
      <p><strong>Количество:</strong> {{ cardInfo.count }}</p>
      <p><strong>Цвет:</strong> {{ cardInfo.color }}</p>
      <img :src="`data:image/png;base64,${cardInfo.image}`" width="180" alt="Order Image" />
    </div>

    <!-- Выбор формы -->
    <div class="form-selector">
      <button
          v-for="form in forms"
          :key="form.id"
          :class="{ active: selectedForm === form.id }"
          @click="selectForm(form.id)"
      >
        {{ form.label }}
      </button>
    </div>

    <div>
      <label for="multiplier">Введите множитель:</label>
      <input
          type="number"
          id="multiplier"
          v-model="multiplier"
          @input="updateValueCount"
      />
    </div>

    <!-- Отображение формы -->
    <div v-if="selectedForm" class="form-main">
      <h3>Форма: {{ currentFormName }}</h3>

      <div class="card-info1">
        <form @submit.prevent="handleSubmit" class="form-form">
        <div v-for="field in formFields" :key="field.name" class="form-field-row">
          <label :for="field.name" class="form-label">{{ field.label }}:</label>
          <!-- Поле типа number -->
          <input
              v-if="field.type === 'number'"
              :type="field.type"
              :id="field.name"
              v-model="formData[field.name]"
              class="form-input"
              step="any"
          />

          <label>Количество:</label>
          <input
              v-if="field.type === 'number'"
              :type="field.type"
              :id="'count_' + field.name"
              v-model="formData['count_' + field.name]"
              @input="updateValue(field)"
              class="form-count"
          />

          <label>Ответственный:</label>
          <select v-model="formData['worker_' + field.name]">
            <option value="">-- Не назначен --</option>
            <option
                v-for="worker in workersList"
                :key="worker.id"
                :value="worker.id"
            >
              {{ worker.last_name }}
            </option>
          </select>

          <!-- Выпадающий список для выбора работника -->
<!--          <label for="workerSelect">Выберите работника:</label>-->
<!--          <select id="workerSelect" v-model="selectedWorker">-->
<!--            <option disabled value="">&#45;&#45; Выберите работника &#45;&#45;</option>-->
<!--            <option-->
<!--                v-for="worker in workersList"-->
<!--                :key="worker.id"-->
<!--                :value="worker.id"-->
<!--            >-->
<!--              {{ worker.last_name }} ({{ worker.profession }})-->
<!--            </option>-->
<!--          </select>-->

        </div>
        <button class="button_submit" type="submit">Отправить</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();

// Список доступных форм (можно загрузить с сервера)
const forms = [
  { id: '1', label: 'КП45 с импостом' },
  { id: '2', label: 'КП40 без импоста' },
  { id: '3', label: 'КП50' },
  { id: '4', label: 'КП55' },
];

// Выбранная форма
const selectedForm = ref(null);

// Данные формы, полученные с сервера
const formConfig = ref(null);
const workersList = ref([]);
//const selectedWorker = ref(null); // Выбранный работник

// Данные для отправки
const formData = ref({});


// Данные карточки (можно загрузить с сервера или передать через query/state)
const cardInfo = ref({
  order_num: route.query.order_num || 'Неизвестно',
  name: route.query.name || 'Неизвестно',
  count: route.query.count || 0,
  color: route.query.color || 'Неизвестно',
  image: route.query.image || '',
});

// Вычисляемое свойство для имени текущей формы
const currentFormName = computed(() => {
  return forms.find((f) => f.id === selectedForm.value)?.label || 'Неизвестная форма';
});

const multiplier = ref(1);

function updateValueCount() {
  //console.log("DDDDDDDDDDDD", formData.value)
  formFields.value.forEach((field) => {
    const countKey = 'count_' + field.name;
    //console.log(countKey)

    formData.value[countKey] = multiplier.value * field.count;

    if (field.count !== 0) {
      formData.value[field.name] = parseFloat((multiplier.value * field.value).toFixed(3));
    }

  });
}

function updateValue(field) {
  const countKey = 'count_' + field.name; // Уникальный ключ для count
  const count = formData.value[countKey]; // Текущее значение "Количество"
  const baseValue = field.value; // Базовое значение (value)

  // Обновляем значение в formData
  formData.value[field.name] = parseFloat(count * baseValue).toFixed(3);

  //console.log("RELATED", field.value)

  if (field.related_fields && field.related_fields.length > 0) {
    field.related_fields.forEach((relatedFieldName) => {
      const relatedField = formFields.value.find((f) => f.name === relatedFieldName);
      //console.log("sadasdasd", relatedField)
      if (relatedField) {
        formData.value['count_' + relatedFieldName] = count; // Устанавливаем то же количество
        formData.value[relatedFieldName] = parseFloat(count * relatedField.value).toFixed(3); // Обновляем значение
      }
    });
  }
}

// Функция для выбора формы
async function selectForm(formId) {
  try {
    // Получаем данные формы с сервера
    const FormResponse = await axios.get(`http://localhost:8080/api/orders/order/product/form?idForm=${formId}`);
    formConfig.value = FormResponse.data;

    // Получаем данные о работниках с сервера
    const workersResponse = await axios.get('http://localhost:8080/api/orders/order/product/workers');
    workersList.value = workersResponse.data.Workers;
    console.log("WOOORK", workersList.value)

    // Инициализация formData значениями по умолчанию
    formData.value = {};
    formConfig.value.fields.forEach((field) => {
      if (field.value !== undefined) {
        formData.value[field.name] = field.value; // Устанавливаем значение по умолчанию
        formData.value['count_' + field.name] = field.count;

        // Инициализация выбранного сотрудника
        formData.value['worker_' + field.name] = ''; // По умолчанию пусто
      } else {
        formData.value[field.name] = ''; // Пустое значение, если default отсутствует
        formData.value['count_' + field.name] = ''; // Пустое значение, если default отсутствует
      }
    });

    console.log("FORM", formData.value)

    // Устанавливаем выбранную форму
    selectedForm.value = formId;
    //console.log(formConfig.value.fields)
  } catch (error) {
    console.error('Ошибка при получении конфигурации формы:', error);
  }
}

function createRequestData(formData) {
  //console.log("SOOOOOSKA", formData.value)
  const requestData = {
    order_num: route.query.order_num || '', // Если order_num не заполнен, отправляем пустую строку
    name: route.query.name || '', // Если name не заполнен, отправляем пустую строку
    count: parseFloat(multiplier.value) || 0, // Преобразуем count в число, если он не заполнен, отправляем 0
    podgotov_oboryd: parseFloat(formData.value.nastr_napil) || 0, // Преобразуем в число, если не заполнено, отправляем 0
    napil_kontr: formData.value.napil_kontyr || 0,
    napil_krishek: formData.value.napil_krishek || 0,
    napil_impost: formData.value.napil_imposta || 0,
    soedinitel: formData.value.soedinitel || 0,
    promej_sborka: formData.value.promej_sborka || 0,
    impost_sverlovka: formData.value.impost_sverlo || 0,
    impost_frezerovka: formData.value.impost_frezer || 0,
    impost_sborka: formData.value.impost_sborka || 0,
    opres_nastr: formData.value.opressovka_nastr || 0,
    opresovka: formData.value.opressovka || 0,
    ystan_yplotnitel: formData.value.ystanovka_yplotn || 0,
    zashivka: formData.value.zashivka || 0,
    profil: formConfig.value.name,
    //...formData.value,
    //17
  };

  //console.log("Generated requestData:", requestData);
  return requestData;
}




// Функция для отправки данных на сервер
async function handleSubmit() {
  //const currentDate = new Date().toISOString();
  const requestData = createRequestData(formData);
  try {
    const assignments = formConfig.value.fields.map(field => ({
      order_num : route.query.order_num,
      name_izd: route.query.name,
      operation_name: field.name,
      worker_id: parseInt(formData.value['worker_' + field.name]),
      value: parseFloat(formData.value[field.name]),
      count: formData.value['count_' + field.name],
      assigned_at: new Date().toISOString() // Дата проставляется для всех операций
    })); // Убираем операции без назначенных сотрудников

    console.log('Назначения сотрудников:', assignments);
    console.log("SELECTRDFORM", selectedForm.value)
    // Отправка POST-запроса на сервер
    const responseForm = await axios.post('http://localhost:8080/api/orders/order/product', requestData);

    const responseAssign = await axios.post('http://localhost:8080/api/orders/order/assignments', assignments)


    console.log('Ответ от сервера (форма):', responseForm.data);
    console.log('Ответ от сервера (назначения):', responseAssign.data);
  } catch (error) {
    console.error('Ошибка:', error.response ? error.response.data : error.message);
  }
}

// Вычисляемое свойство для полей формы
const formFields = computed(() => {
  return formConfig.value?.fields || [];
});

</script>

<style>
.card-info {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

label {
  font-weight: bold;
}

textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/*TODO new*/
.card-info1 {
  font-family: Arial, sans-serif;
  width: 100%; /* Родительский контейнер занимает всю ширину */
  max-width: 100%; /* Ограничение максимальной ширины для удобства чтения */
  margin: 0 auto; /* Центрирование контейнера по горизонтали */
  padding: 20px; /* Внутренний отступ */
  box-sizing: border-box; /* Учитываем padding в ширине */
  /*display: block;*/
}

.form-main {
  width: 100%;
  height: 100%;
  display: block;
  flex-direction: row;
  width: 100%; /* Форма занимает всю ширину родительского контейнера */
}

.form-form {
  max-width: 100%;
}

.form-field-row {
  display: flex; /* Используем flexbox для создания строки */
  align-items: center; /* Выравниваем элементы по вертикали */
  justify-content: space-between; /* Распределяем элементы равномерно */
  margin-bottom: 10px; /* Отступ между строками */
}

.form-label {
  flex: 1; /* Занимает 1 часть ширины */
  text-align: right; /* Выравниваем текст по правому краю */
  margin-right: 10px; /* Отступ справа */
}

.form-input {
  flex: 2; /* Занимает 2 части ширины (центральный столбец) */
  margin: 0 10px; /* Отступы слева и справа */
  padding: 5px; /* Внутренний отступ для input */
  max-width: 10%; /* Полная ширина внутри flex-контейнера */
  box-sizing: border-box; /* Учитываем padding и border в ширине */
}

.form-count {
  /*flex: 1; !* Занимает 2 части ширины (центральный столбец) *!*/
  margin: 0 10px; /* Отступы слева и справа */
  padding: 5px; /* Внутренний отступ для input */
  max-width: 10%; /* Полная ширина внутри flex-контейнера */
  /*box-sizing: border-box; !* Учитываем padding и border в ширине *!*/
}

.button_submit {
  flex: 2;
  max-width: 10%;
  align-items: center;
}

</style>