<template>
  <div>
    <h2>Форма для изделия {{ cardInfo.name }}</h2>

    <!-- Информация о карточке -->
    <div class="card-info">
      <p><strong>Номер заказа:</strong> {{cardInfo.order_num}} </p>
      <p><strong>Название:</strong> {{ cardInfo.name }}</p>
      <p><strong>Количество:</strong> {{ cardInfo.count }}</p>
      <p><strong>Цвет:</strong> {{ cardInfo.color }}</p>
      <p><strong>Заказчик:</strong> {{ cardInfo.customer }}</p>
      <img :src="`data:image/png;base64,${cardInfo.image}`" width="180" alt="Order Image" />
    </div>

    <!-- Выбор формы -->
    <!-- Выбор формы по группам -->
    <div class="form-selector-grouped">
      <div v-for="group in productGroups" :key="group.groupId" class="form-group">
        <h3>{{ group.groupName }}</h3>
        <div class="form-buttons">
          <button
              v-for="form in group.forms"
              :key="form.id"
              :class="{ active: selectedForm === form.id }"
              @click="selectForm(form.id)"
              class="form-button"
          >
            {{ form.label }}
          </button>
        </div>
      </div>
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
      <h3>Форма: {{ currentFormGroup.groupName }}</h3>

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
              min="0"
          />

          <label>Количество:</label>
          <input
              v-if="field.type === 'number'"
              :type="field.type"
              :id="'count_' + field.name"
              v-model="formData['count_' + field.name]"
              @input="updateValue(field)"
              class="form-count"
              step="any"
              min="0"
          />

          <label>Время:</label>
          <input
              v-if="field.type === 'number'"
              :type="field.type"
              :id="'time_' + field.name"
              v-model="formData['time_' + field.name]"
              @input="updateValue(field)"
              class="form-count"
              step="any"
              min="0"
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
import router from "@/router";

const route = useRoute();

// Список доступных форм (можно загрузить с сервера)
// Сгруппированный список доступных форм
const productGroups = [
  {
    groupId: '1', // ID группы глухих окон
    groupName: 'Глухие изделия',
    forms: [
      { id: '1', label: 'глухарь КП45 с импостом' },
      { id: '2', label: 'глухарь КП45 без импоста' },
      { id: '3', label: 'глухарь П-образ. КПТ74 сбор' },
      { id: '4', label: 'глухарь П-образ. КПТ74 пресс' },
      { id: '5', label: 'глухарь Алютех сбор' },
      { id: '6', label: 'глухарь П шуко' },
      { id: '7', label: 'глухарь Алютех F50' },
      { id: '8', label: 'глухарь П-образ КП45 пресс' },
      { id: '9', label: 'глухарь П-образ КП45 сбор' },
      { id: '10', label: 'глухарь КПТ74' },
      { id: '11', label: 'глухарь КП45 с замком' },
      { id: '12', label: 'глухарь СЛ60 сбор' },
      { id: '13', label: 'глухарь СЛ60 пресс' },
      { id: '14', label: 'глухарь 45400 2м' },
      { id: '15', label: 'глухарь 45400' },
      { id: '31', label: 'окна Алютех глухарь косой' },
      { id: '32', label: 'окна Алютех глухарь' },
    ]
  },
  {
    groupId: '2', // ID группы окон
    groupName: 'Окна',
    forms: [
      { id: '16', label: 'окна Шуко вент створка' },
      { id: '17', label: 'окна Шуко эркер один глух' },
      { id: '18', label: 'окна Шуко Эркер' },
      { id: '19', label: 'окна Шуко штульп' },
      { id: '20', label: 'окна Шуко' },
      { id: '21', label: 'окна Гармошка' },
      { id: '22', label: 'окна Алютех вент створка' },
      { id: '23', label: 'рама HI сбор' },
      { id: '24', label: 'окна Алютех Hi' },
      { id: '25', label: 'окна Алютех MACO' },
      { id: '26', label: 'окна Алютех ROTO W77' },
      { id: '27', label: 'окна Алютех ROTO' },
      { id: '28', label: 'окна Алютех наруж отк' },
      { id: '29', label: 'окна Алютех Shtublina' },
      { id: '30', label: 'окна Алютех PSK' },
      { id: '33', label: 'окна КПТ74 с ручкой Roto' },
      { id: '34', label: 'окна КПТ74 с ручкой Maco' },
      { id: '35', label: 'окна КПТ74 с ручкой Giesse' },
      { id: '36', label: 'створки окна КП45' },
      { id: '37', label: 'окна КП45' },
    ]
  },
  {
    groupId: '3',
    groupName: 'Двери',
    forms: [
      { id: '38', label: 'двери Шуко AWS50 1.5П' },
      { id: '39', label: 'двери Шуко AWS50 1П' },
      { id: '40', label: 'двери Шуко AWS75 1.5П' },
      { id: '41', label: 'двери Шуко AWS75 1П' },
      { id: '42', label: 'двери 2П противопожарные КПТ74' },
      { id: '43', label: 'двери 2П Антипаника КПТ74' },
      { id: '44', label: 'двери 2П КПТ74 (2)' },
      { id: '45', label: 'двери 1П КПТ74 (2)' },
      { id: '46', label: 'двери 2П СТ71' },
      { id: '47', label: 'двери 1П СТ71' },
      { id: '48', label: 'двери 1.5П Алютех W72 Hi' },
      { id: '49', label: 'двери 1.5П Алютех W72 (2)' },
      { id: '50', label: 'двери 1П Алютех Hi' },
      { id: '51', label: 'двери 1П Алютех (2)' },
      { id: '52', label: 'двери 1П Алютех 111' },
      { id: '53', label: 'двери 2П КП45 без притвора' },
      { id: '54', label: 'двери 1.5П КП45 (2)' },
      { id: '55', label: 'двери 1П КП45 (2)' },
      { id: '56', label: 'двери 2П КП45 маятник' },
      { id: '57', label: 'двери 2П маятник' },
      { id: '58', label: 'двери 1П маятник' },
      { id: '59', label: 'двери 2П откат' },
      { id: '60', label: 'двери 1П откат' },
      { id: '61', label: 'двери 2П автомат' },
      { id: '62', label: 'Створки туалетные' },
    ]
  },
];

// Выбранная форма
const selectedForm = ref(null);

// Данные формы, полученные с сервера
const formConfig = ref(null);
const workersList = ref([]);
//const selectedWorker = ref(null); // Выбранный работник

// Данные для отправки
const formData = ref({});

console.log("ROOOOOOOO", route.query)

// Данные карточки (можно загрузить с сервера или передать через query/state)
const cardInfo = ref({
  order_num: route.query.order_num || 'Неизвестно',
  name: route.query.name || 'Неизвестно',
  count: route.query.count || 0,
  color: route.query.color || 'Неизвестно',
  image: route.query.image || '',
  customer: route.query.customer || '',
});

// Вычисляемое свойство для имени текущей формы
const currentFormGroup = computed(() => {
  if (!selectedForm.value) return null;
  for (const group of productGroups) {
    if (group.forms.some(f => f.id === selectedForm.value)) {
      return group;
    }
  }
  return null;
});

const formGroupsMap = computed(() => {
  const map = {};
  productGroups.forEach(group => {
    group.forms.forEach(form => {
      map[form.id] = group.groupId;
    });
  });
  return map;
});

//console.log("CUUUUUUUUUUUU", currentFormGroup)

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
 // const minute = field.minutes;

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
    console.log("Получение формы", FormResponse)

    // Получаем данные о работниках с сервера
    const workersResponse = await axios.get('http://localhost:8080/api/orders/order/product/workers');
    workersList.value = workersResponse.data.Workers;
    //console.log("WOOORK", workersList.value)

    // Инициализация formData значениями по умолчанию
    formData.value = {};
    formConfig.value.fields.forEach((field) => {
      if (field.value !== undefined) {
        formData.value[field.name] = field.value; // Устанавливаем значение по умолчанию
        formData.value['count_' + field.name] = field.count;
        formData.value['time_' + field.name] = field.minutes;

        // Инициализация выбранного сотрудника
        formData.value['worker_' + field.name] = ''; // По умолчанию пусто
      } else {
        formData.value[field.name] = ''; // Пустое значение, если default отсутствует
        formData.value['count_' + field.name] = ''; // Пустое значение, если default отсутствует
        formData.value[field.minutes] = '';
      }
    });

    //console.log("FORM", formData.value)

    // Устанавливаем выбранную форму
    selectedForm.value = formId;
    //console.log(formConfig.value.fields)
  } catch (error) {
    console.error('Ошибка при получении конфигурации формы:', error);
  }
}

function createRequestDataGlyhari(formData) {
  //console.log("SOOOOOSKA", formData.value)
  const requestData = {
    order_num: route.query.order_num || '', // Если order_num не заполнен, отправляем пустую строку
    name: route.query.name || '', // Если name не заполнен, отправляем пустую строку
    count: parseInt(route.query.count) || 0, // Преобразуем count в число, если он не заполнен, отправляем 0
    nast_napil: parseFloat(formData.value.nastr_napil) || 0, // Преобразуем в число, если не заполнено, отправляем 0
    napil_kontr: parseFloat(formData.value.napil_kontyr) || 0,
    napil_krishek: parseFloat(formData.value.napil_krishek) || 0,
    napil_impost: parseFloat(formData.value.napil_imposta )|| 0,
    soedinitel: parseFloat(formData.value.soedinitel)|| 0,
    promej_sborka: parseFloat(formData.value.promej_sborka) || 0,
    impost_sverlovka: parseFloat(formData.value.impost_sverlo) || 0,
    impost_frezerovka: parseFloat(formData.value.impost_frezer) || 0,
    impost_sborka: parseFloat(formData.value.impost_sborka) || 0,
    opres_nastr: parseFloat(formData.value.opres_nastr) || 0,
    opresovka: parseFloat(formData.value.opresovka) || 0,
    ystan_yplotnitel: parseFloat(formData.value.ystanovka_yplotn) || 0,
    zashivka: parseFloat(formData.value.zashivka) || 0,
    profil: formConfig.value.name,
    napil_stoiki_do3m: parseFloat(formData.value.napil_stoiki_do3m) || 0,
    napil_stoiki_bol3m: parseFloat(formData.value.napil_stoiki_bol3m) || 0,
    napil_rigel_do1m: parseFloat(formData.value.napil_rigel_do1m) || 0,
    napil_rigel_bol1m: parseFloat(formData.value.napil_rigel_bol1m) || 0,
    sverl_rigel_zamok: parseFloat(formData.value.sverl_rigel_zamok) || 0,
    ystan_zamkov: parseFloat(formData.value.ystan_zamkov) || 0,
    napil_shtapik: parseFloat(formData.value.napil_shtapik) || 0,
    ypakovka: parseFloat(formData.value.ypakovka) || 0,
    frezer_rigel: parseFloat(formData.value.frezer_rigel) || 0,
    obrabot_ram: parseFloat(formData.value.obrabot_ram) || 0,
    hands_sborka: parseFloat(formData.value.hands_sborka) || 0,
    frezer_nastr: parseFloat(formData.value.frezer_nastr) || 0,
    shtiftovka: parseFloat(formData.value.shtiftovka) || 0,
    ystanovka_zapoln: parseFloat(formData.value.ystanovka_zapoln) || 0,
    napil_donnik: parseFloat(formData.value.napil_donnik) || 0,
    adapter_napil: parseFloat(formData.value.adapter_napil) || 0,
    adapter_ystan: parseFloat(formData.value.adapter_ystan) || 0,
    ystan_yplotn_falc: parseFloat(formData.value.ystan_yplotn_falc) || 0
    //total_sum: totalSum
    //36
  };

  let totalSum = 0;
  if (formConfig.value && Array.isArray(formConfig.value.fields)) {
    formConfig.value.fields.forEach(field => {
      //Вариант 1: Суммировать вычисленное значение времени (value * count)
      const timeValue = parseFloat(formData.value[field.name]);
      if (!isNaN(timeValue)) {
        totalSum += timeValue;
      }
    });
  }

  requestData.total_time = parseFloat(totalSum.toFixed(3)); // Округляем до 3 знаков после запятой, если нужно

  //console.log("Generated requestData for Blind Products (Group 1):WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", requestData);
  return requestData;
}

//TODO реквест для оконных изделии
function createRequestDataWindows (formData) {
  const requestData = {
    order_num: route.query.order_num || '', // Если order_num не заполнен, отправляем пустую строку
    name: route.query.name || '', // Если name не заполнен, отправляем пустую строку
    count: parseFloat(multiplier.value) || 0, // Преобразуем count в число, если он не заполнен, отправляем 0
    profil: formConfig.value.name || '',
    podgot_oboryd: parseFloat(formData.value.podgot_oboryd) || 0,
    napil_ram_stv: parseFloat(formData.value.napil_ram_stv) || 0,
    napil_nram_stv: parseFloat(formData.value.napil_nram_stv) || 0,
    napil_imposta: parseFloat(formData.value.napil_imposta) || 0,
    sverlovka_stoek: parseFloat(formData.value.sverlovka_stoek) || 0,
    obrabot_ram: parseFloat(formData.value.obrabot_ram) || 0,
    obrabotka_stv: parseFloat(formData.value.obrabotka_stv )|| 0,
    promej_sborka_stv: parseFloat(formData.value.promej_sborka_stv) || 0,
    napil_adaptera: parseFloat(formData.value.napil_adaptera) || 0,
    promej_sborka_ram: parseFloat(formData.value.promej_sborka_ram) || 0,
    promej_sborka_gl: parseFloat(formData.value.promej_sborka_gl) || 0,
    opres_ram: parseFloat(formData.value.opres_ram) || 0,
    opres_gl: parseFloat(formData.value.opres_gl) || 0,
    frezer_stv: parseFloat(formData.value.frezer_stv) || 0,
    ystan_ypl_ram: parseFloat(formData.value.ystan_ypl_ram) || 0,
    ystan_ypl_stv: parseFloat(formData.value.ystan_ypl_stv) || 0,
    napil_tag: parseFloat(formData.value.napil_tag) || 0,
    sverlo_tag: parseFloat(formData.value.sverlo_tag) || 0,
    ystan_furn: parseFloat(formData.value.ystan_furn) || 0,
    navesh_stv: parseFloat(formData.value.navesh_stv) || 0,
    zashivka: parseFloat(formData.value.zashivka) || 0,
    obrab_dop_profil: parseFloat(formData.value.obrab_dop_profil) || 0,
    ystan_adaptera: parseFloat(formData.value.ystan_adaptera) || 0,
    frezer_impost_pilon: parseFloat(formData.value.frezer_impost_pilon) || 0,
    krepl_ygl_ram: parseFloat(formData.value.krepl_ygl_ram) || 0,
    glyhar_dorab: parseFloat(formData.value.glyhar_dorab) || 0,
    yplot_glyhar: parseFloat(formData.value.yplot_glyhar) || 0,
    zashiv_glyhar: parseFloat(formData.value.zashiv_glyhar) || 0,
    opres_stv: parseFloat(formData.value.opres_stv) || 0,
    razbor_erkera: parseFloat(formData.value.razbor_erkera) || 0,
    gl_window: parseFloat(formData.value.gl_window) || 0,
    obrabot_shtylp: parseFloat(formData.value.obrabot_shtylp) || 0,
    frezer_pod_shtylp: parseFloat(formData.value.frezer_pod_shtylp) || 0,
    ystan_shtylp: parseFloat(formData.value.ystan_shtylp) || 0,
    ystan_impost: parseFloat(formData.value.ystan_impost) || 0,
    nastr_for_opres: parseFloat(formData.value.nastr_for_opres) || 0,
    napil_ram: parseFloat(formData.value.napil_ram) || 0,
    napil_nram: parseFloat(formData.value.napil_nram) || 0,
    napil_dop_profil: parseFloat(formData.value.napil_dop_profil) || 0,
    frezer_dop_profil: parseFloat(formData.value.frezer_dop_profil) || 0,
    obrabotka_stv_rychka: parseFloat(formData.value.obrabotka_stv_rychka) || 0,
    obrabotka_stv_zamok: parseFloat(formData.value.obrabotka_stv_zamok) || 0,
    napil_shtylp: parseFloat(formData.value.napil_shtylp) || 0,
    impost_sbor: parseFloat(formData.value.impost_sbor) || 0,
    rezina_ram: parseFloat(formData.value.rezina_ram) || 0,
    podgotov_furn: parseFloat(formData.value.podgotov_furn) || 0,
    podgotov_ram: parseFloat(formData.value.podgotov_ram) || 0,
    razborka: parseFloat(formData.value.razborka) || 0,
    napil_zashit_prof: parseFloat(formData.value.napil_zashit_prof) || 0,
    impost_frezer: parseFloat(formData.value.impost_frezer) || 0,
    ystan_stekla_zaliv: parseFloat(formData.value.ystan_stekla_zaliv) || 0,
    ystan_krishek: parseFloat(formData.value.ystan_krishek) || 0,
    frezer_profil_zamazka: parseFloat(formData.value.frezer_profil_zamazka) || 0,
    napil_stoiki_do3m: parseFloat(formData.value.napil_stoiki_do3m) || 0,
    napil_stoiki_bol3m: parseFloat(formData.value.napil_stoiki_bol3m) || 0,
    napil_rigel_do1m: parseFloat(formData.value.napil_rigel_do1m) || 0,
    napil_rigel_bol1m: parseFloat(formData.value.napil_rigel_bol1m) || 0,
    sverlo_rigel_zamok: parseFloat(formData.value.sverlo_rigel_zamok) || 0,
    ystan_zamok: parseFloat(formData.value.ystan_zamok) || 0,
    shtiftovka: parseFloat(formData.value.shtiftovka) || 0,
    frezer_rigel: parseFloat(formData.value.frezer_rigel) || 0,
    part_sborka: parseFloat(formData.value.part_sborka) || 0,
    ystan_rez_ygl: parseFloat(formData.value.ystan_rez_ygl) || 0,
    opres_ygl: parseFloat(formData.value.opres_ygl) || 0,
    ystan_termovst: parseFloat(formData.value.ystan_termovst) || 0,
    napil_shtapik:parseFloat( formData.value.napil_shtapik) || 0,
    ypak_sekcii: parseFloat(formData.value.ypak_sekcii) || 0,
    ypak_rigel: parseFloat(formData.value.ypak_rigel) || 0,
    ypak_yplotn: parseFloat(formData.value.ypak_yplotn) || 0,
    ypak_shtapik: parseFloat(formData.value.ypak_shtapik) || 0,
    napil_donnika: parseFloat(formData.value.napil_donnika) || 0,
    nastr_pbx: parseFloat(formData.value.nastr_pbx) || 0,
    meh_obrab_pzr: parseFloat(formData.value.meh_obrab_pzr) || 0,
    rabota_pbx: parseFloat(formData.value.rabota_pbx) || 0,
    slesar_obr_furn: parseFloat(formData.value.slesar_obr_furn) || 0,
    impost_sverlo: parseFloat(formData.value.impost_sverlo) || 0,
    opresovka: parseFloat(formData.value.opresovka) || 0,
    sbor_rychka: parseFloat(formData.value.sbor_rychka) || 0,
    sbor_petli: parseFloat(formData.value.sbor_petli) || 0,
    plastik_ystn_ram: parseFloat(formData.value.plastik_ystn_ram) || 0,
    napil_stv: parseFloat(formData.value.napil_stv) || 0,
    ystan_furn_stv: parseFloat(formData.value.ystan_furn_stv) || 0,
    ystan_furn_ram: parseFloat(formData.value.ystan_furn_ram) || 0,
    compl_otg: parseFloat(formData.value.compl_otg) || 0,
    ypak_izd: parseFloat(formData.value.ypak_izd) || 0,
    otgryz: parseFloat(formData.value.otgryz) || 0,
    rasp_furn: parseFloat(formData.value.rasp_furn) || 0
  };

  let totalSum = 0;
  if (formConfig.value && Array.isArray(formConfig.value.fields)) {
    formConfig.value.fields.forEach(field => {
      //Вариант 1: Суммировать вычисленное значение времени (value * count)
      const timeValue = parseFloat(formData.value[field.name]);
      if (!isNaN(timeValue)) {
        totalSum += timeValue;
      }
    });
  }

  requestData.total_time = parseFloat(totalSum.toFixed(3));

  return requestData;
}

//TODO реквест для дверных изделии
function createRequestDataDoor (formData) {
  const requestData = {
    order_num: route.query.order_num || '', // Если order_num не заполнен, отправляем пустую строку
    name: route.query.name || '', // Если name не заполнен, отправляем пустую строку
    count: parseFloat(multiplier.value) || 0, // Преобразуем count в число, если он не заполнен, отправляем 0
    profil: formConfig.value.name || '',
    napil_ram_stv: parseFloat(formData.value.napil_ram_stv) || 0,
    petli_obr: parseFloat(formData.value.petli_obr) || 0,
    zamok_obr: parseFloat(formData.value.zamok_obr) || 0,
    shping_obr_stv: parseFloat(formData.value.shping_obr_stv) || 0,
    shping_obr_ram: parseFloat(formData.value.shping_obr_ram) || 0,
    ystan_zakld: parseFloat(formData.value.ystan_zakld) || 0,
    sverl_otv_shtift: parseFloat(formData.value.sverl_otv_shtift )|| 0,
    frezer_stoek_rigel: parseFloat(formData.value.frezer_stoek_rigel) || 0,
    sborka_ram: parseFloat(formData.value.sborka_ram) || 0,
    shitf_ram: parseFloat(formData.value.shitf_ram) || 0,
    opres_stv: parseFloat(formData.value.opres_stv) || 0,
    sbor_stv: parseFloat(formData.value.sbor_stv) || 0,
    shift_stv: parseFloat(formData.value.shift_stv) || 0,
    nanes_klei: parseFloat(formData.value.nanes_klei) || 0,
    ystan_ypl_ram: parseFloat(formData.value.ystan_ypl_ram) || 0,
    ystan_ypl_stv: parseFloat(formData.value.ystan_ypl_stv) || 0,
    yst_zamok_nakl: parseFloat(formData.value.yst_zamok_nakl) || 0,
    yst_shping_otv: parseFloat(formData.value.yst_shping_otv) || 0,
    sbor_petli_ram: parseFloat(formData.value.sbor_petli_ram) || 0,
    sbor_yst_porog: parseFloat(formData.value.sbor_yst_porog) || 0,
    naveshiv: parseFloat(formData.value.naveshiv) || 0,
    zashiv: parseFloat(formData.value.zashiv) || 0,
    opres_ram: parseFloat(formData.value.opres_ram) || 0,
    sbor_petli_stv: parseFloat(formData.value.sbor_petli_stv) || 0,
    nastr_stanok: parseFloat(formData.value.nastr_stanok) || 0,
    nastr_pbx: parseFloat(formData.value.nastr_pbx) || 0,
    meh_obrab_pzr: parseFloat(formData.value.meh_obrab_pzr) || 0,
    rabota_pbx: parseFloat(formData.value.rabota_pbx) || 0,
    frezer_nastr: parseFloat(formData.value.frezer_nastr) || 0,
    frezer_porog_sborka: parseFloat(formData.value.frezer_porog_sborka) || 0,
    frezer_yst_shtyp: parseFloat(formData.value.frezer_yst_shtyp) || 0,
    opres_nastr: parseFloat(formData.value.opres_nastr) || 0,
    opres: parseFloat(formData.value.opres) || 0,
    podg_derj_shetki: parseFloat(formData.value.podg_derj_shetki) || 0,
    yst_porog_ypl_dr: parseFloat(formData.value.yst_porog_ypl_dr) || 0,
    naveshiv_stv: parseFloat(formData.value.naveshiv_stv) || 0,
    yst_zapoln: parseFloat(formData.value.yst_zapoln) || 0,
    impost_napil: parseFloat(formData.value.impost_napil) || 0,
    impost_frezer: parseFloat(formData.value.impost_frezer) || 0,
    impost_sverlo: parseFloat(formData.value.impost_sverlo) || 0,
    impost_yst: parseFloat(formData.value.impost_yst) || 0,
    impost_shtift: parseFloat(formData.value.impost_shtift) || 0,
    ypl_falc: parseFloat(formData.value.ypl_falc) || 0,
    napil_nalich: parseFloat(formData.value.napil_nalich) || 0,
    napil_ram: parseFloat(formData.value.napil_ram) || 0,
    napil_stv: parseFloat(formData.value.napil_stv) || 0,
    kontr_sbork: parseFloat(formData.value.kontr_sbork) || 0,
    sverl_ram: parseFloat(formData.value.sverl_ram) || 0,
    sverl_zink: parseFloat(formData.value.sverl_zink) || 0,
    zashit_pl: parseFloat(formData.value.zashit_pl) || 0,
    sbor_ram: parseFloat(formData.value.sbor_ram) || 0,
    napil_yst_krish_stv: parseFloat(formData.value.napil_yst_krish_stv) || 0,
    napil_yst_krish_ram: parseFloat(formData.value.napil_yst_krish_ram) || 0,
    sbor_petli: parseFloat(formData.value.sbor_petli) || 0,
    yst_ptli_ram_stv: parseFloat(formData.value.yst_ptli_ram_stv) || 0,
    rezka_plast: parseFloat(formData.value.rezka_plast) || 0,
    brysok: parseFloat(formData.value.brysok) || 0,
    izg_pritv: parseFloat(formData.value.izg_pritv) || 0,
    obr_pritv: parseFloat(formData.value.obr_pritv) || 0,
    yst_pritv: parseFloat(formData.value.yst_pritv) || 0,
    obrabotka_all: parseFloat(formData.value.obrabotka_all) || 0,
    ystan_pln_petli: parseFloat(formData.value.ystan_pln_petli) || 0,
    yst_fetr: parseFloat(formData.value.yst_fetr) || 0,
    rezina: parseFloat(formData.value.rezina) || 0,
    frezer_shping: parseFloat(formData.value.frezer_shping) || 0,
    gl:parseFloat( formData.value.gl) || 0,
    fortochka: parseFloat(formData.value.fortochka) || 0,
    ypak: parseFloat(formData.value.ypak) || 0,
  };

  let totalSum = 0;
  if (formConfig.value && Array.isArray(formConfig.value.fields)) {
    formConfig.value.fields.forEach(field => {
      //Вариант 1: Суммировать вычисленное значение времени (value * count)
      const timeValue = parseFloat(formData.value[field.name]);
      if (!isNaN(timeValue)) {
        totalSum += timeValue;
      }
    });
  }

  requestData.total_time = parseFloat(totalSum.toFixed(3));

  return requestData;
}


const GROUP_HANDLERS = {
  1: {
    url: 'http://localhost:8080/api/orders/order/product/gl',
    dataFn: createRequestDataGlyhari,
    printType: 'glyhar',  // ← тип для печати
  },
  2: {
    url: 'http://localhost:8080/api/orders/order/product/window',
    dataFn: createRequestDataWindows,
    printType: 'window',  // ← тип для печати
  },
  3: {
    url: 'http://localhost:8080/api/orders/order/product/door',
    dataFn: createRequestDataDoor,
    printType: 'door',  // ← тип для печати
  }
  // Добавляй новые группы сюда
  // 3: { url: '...', dataFn: createRequestDataWorker },
};


// Функция для отправки данных на сервер
async function handleSubmit() {

  const currentFormId = selectedForm.value;
  const groupId = formGroupsMap.value[currentFormId];//const currentDate = new Date().toISOString();

  //console.log(`Форма ${currentFormId} относится к группе ${groupId}`);

  const handler = GROUP_HANDLERS[groupId];

  if (!handler) {
    console.error('Нет обработчика для группы:', groupId);
    alert(`Неизвестная группа: ${groupId}`);
    return;
  }

  //const requestData = createRequestDataGlyhari(formData);
  try {
    // const assignments = formConfig.value.fields.map(field => ({
    //   order_num : route.query.order_num,
    //   name_izd: route.query.name,
    //   operation_name: field.name,
    //   worker_id: parseInt(formData.value['worker_' + field.name]),
    //   value: parseFloat(formData.value[field.name]),
    //   count: formData.value['count_' + field.name],
    //   assigned_at: new Date().toISOString() // Дата проставляется для всех операций
    // })); // Убираем операции без назначенных сотрудников

    // Формируем данные с помощью нужной функции
    const finalRequestData = handler.dataFn(formData);

    console.log("FIIIIIINAAAAAALL", finalRequestData);
    // Отправляем
    const responseForm = await axios.post(handler.url, finalRequestData);
    console.log('Успешно отправлено:', responseForm.data);

    const orderId = responseForm.data.id || responseForm.data.ID;
    if (!orderId) {
      console.error('Не получен ID после сохранения');
      return;
    }

    //const responseAssign = await axios.post('http://localhost:8080/api/orders/order/assignments', assignments)

    // Берём ID из ответа
    //const orderId = responseForm.data.id; // или responseForm.data.ID

// Редиректим на страницу печати по ID
    //router.push(`/api/master/orders/order/${orderId}`);
    router.push({
      name: "FormPrintNorm",
      params: {id: orderId},
      query: {type: handler.printType, customer: route.query.customer}
    });

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

/* Группировка форм */
.form-selector-grouped {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
}

.form-group h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.form-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-button {
  padding: 8px 12px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-button:hover {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.form-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

</style>