<template>
  <div class="peo-report">
    <!-- Фильтры по типу -->
    <div class="filters">
      <!-- Год -->
      <div class="filter-group">
        <label for="year-select">Год</label>
        <select id="year-select" v-model="year" @change="loadData" class="filter-select">
          <option v-for="y in [2023, 2024, 2025, 2026, 2027]" :key="y">{{ y }}</option>
        </select>
      </div>

      <!-- Месяц -->
      <div class="filter-group">
        <label for="month-select">Месяц</label>
        <select id="month-select" v-model="month" @change="loadData" class="filter-select">
          <option v-for="(name, index) in months" :key="index + 1" :value="index + 1">
            {{ name }}
          </option>
        </select>
      </div>

      <!-- Номер заказа -->
      <div class="filter-group">
        <label for="order-input">№ заказа</label>
        <input
            id="order-input"
            type="text"
            v-model="orderNum"
            placeholder="Q6-123"
            @input="loadData"
            class="filter-input"
        />
      </div>

      <!-- Типы продукции -->
      <div class="type-filters">
        <label v-for="(group, key) in typeGroups" :key="key" class="checkbox-label">
          <input
              type="checkbox"
              :value="key"
              v-model="selectedTypes"
              @change="loadData"
              class="checkbox-input"
          />
          <span class="checkbox-text">{{ group.label }}</span>
        </label>
      </div>
    </div>

    <!-- 2. Сводная статистика (новое) -->
<!--    <div class="summary-stats">-->
<!--      <h4>Итоги за период</h4>-->

<!--      <table class="summary-table">-->
<!--        <thead>-->
<!--        <tr>-->
<!--          <th>Наименование</th>-->
<!--          <th>Профиль</th>-->
<!--          <th>Кол-во</th>-->
<!--          <th>Площадь, м²</th>-->
<!--          <th>Н/час</th>-->
<!--          <th>Н/руб</th>-->
<!--        </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--        &lt;!&ndash; Основные строки &ndash;&gt;-->
<!--        <tr v-for="(group, idx) in summaryGroups" :key="idx">-->
<!--          <td>{{ group.type_izd }}</td>-->
<!--          <td>{{ group.profile }}</td>-->
<!--          <td>{{ group.count }}</td>-->
<!--          <td>{{ group.sqr.toFixed(1) }}</td>-->
<!--          <td>{{ group.hours.toFixed(1) }}</td>-->
<!--          <td>{{ group.money.toFixed(1) }}</td>-->
<!--        </tr>-->

<!--        &lt;!&ndash; Итоговая строка &ndash;&gt;-->
<!--        <tr class="total-row">-->
<!--          <td colspan="2"><strong>Всего:</strong></td>-->
<!--          <td><strong>{{ totalProducts }}</strong></td>-->
<!--          <td><strong>{{ totalSqr.toFixed(1) }}</strong></td>-->
<!--          <td><strong>{{ totalHours.toFixed(1) }}</strong></td>-->
<!--          <td><strong>{{ totalMoney.toFixed(1) }}</strong></td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </table>-->
<!--    </div>-->


<!--    <div class="summary-stats">-->
<!--      <h4>Всего за месяц</h4>-->

<!--      <table class="summary-table">-->
<!--        <thead>-->
<!--        <tr>-->
<!--          <th>Наименование</th>-->
<!--          <th>Профиль</th>-->
<!--          <th>Кол-во</th>-->
<!--          <th>Площадь, м²</th>-->
<!--          <th>Н/час</th>-->
<!--          <th>Н/руб</th>-->
<!--        </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--        &lt;!&ndash; Основные строки &ndash;&gt;-->
<!--        <tr v-for="(group, idx) in customSummaryGroup" :key="idx">-->
<!--          <td>{{ group.type_izd }}</td>-->
<!--          <td>{{ group.profile }}</td>-->
<!--          <td>{{ group.count }}</td>-->
<!--          <td>{{ group.sqr.toFixed(1) }}</td>-->
<!--          <td>{{ group.hours.toFixed(1) }}</td>-->
<!--          <td>{{ group.money.toFixed(1) }}</td>-->
<!--        </tr>-->

<!--        &lt;!&ndash; Итоговая строка &ndash;&gt;-->
<!--        <tr class="total-row">-->
<!--          <td colspan="2"><strong>Всего:</strong></td>-->
<!--          <td><strong>{{ totalProducts }}</strong></td>-->
<!--          <td><strong>{{ totalSqr.toFixed(1) }}</strong></td>-->
<!--          <td><strong>{{ totalHours.toFixed(1) }}</strong></td>-->
<!--          <td><strong>{{ totalMoney.toFixed(1) }}</strong></td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </table>-->
<!--    </div>-->

    <!-- После фильтров -->
    <SummaryReport :products="filteredProductsWithRowNumber" />

    <!-- 4. Модальное окно (если нужно редактировать) -->
    <div v-if="editingProduct" class="modal">
      <!-- форма редактирования -->
    </div>

    <!-- Таблица -->
    <div class="table-container">
      <table class="report-table">
        <thead>
        <tr>
          <th>Статус</th>
          <th>№</th>
          <th>Спецификация</th>
          <th>№ заказа</th>
          <th>корп/дил</th>
          <th>Заказчик</th>
          <th>Вид продукции</th>
          <th>Система</th>
          <th>Наименование</th>
          <th>Профиль</th>
          <th>Кол-во</th>
          <th>Площадь</th>
          <th>Н/час</th>
          <th>Изготовитель</th>
          <th>Н/руб</th>
          <th v-for="emp in employees" :key="emp.id" class="employee-col">
            {{ emp.name }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="prod in filteredProductsWithRowNumber" :key="prod.id">
          <td>{{ statusType(prod.status) }}</td>
          <td>{{ prod.rowNumber }}</td>
          <td>{{ prod.parent_assembly }}</td>
          <td>{{ prod.order_num }}</td>
          <td>{{ prod.customer_type }}</td>
          <td>{{ prod.customer }}</td>
          <td>{{ formatType(prod.type) }}</td>
          <td
              :class="{
                'profile-empty': prod.systema === 'не определено',
                'cell-warning': prod.systema === 'не определено'
            }"
          >
            {{ prod.systema }}
          </td>
          <td
              :class="{
                'profile-empty': prod.type_izd === 'не определено',
                'cell-warning': prod.type_izd === 'не определено'
            }"
          >
            {{ prod.type_izd }}
          </td>
          <td
              :class="{
                'profile-empty': prod.profile === 'не определено',
                'cell-warning': prod.profile === 'не определено'
            }"
          >
            {{ prod.profile }}
          </td>
          <td>{{ prod.count }}</td>
          <td>{{ prod.sqr }}</td>
          <td>{{ prod.total_time }}</td>
          <td>бригада</td>
          <td>н/р</td>
          <td v-for="emp in employees" :key="emp.id" class="employee-col">
            {{ getMinutes(prod, emp.id) }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Кнопка экспорта -->
    <div class="actions">
      <button @click="exportToExcel" class="btn-export">
         Экспорт в Excel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ExcelJS from 'exceljs';

const currentYear = new Date().getFullYear();
const year = ref(currentYear); // можно добавить выбор года, если нужно
const month = ref(new Date().getMonth() + 1); // текущий месяц: 1–12
const orderNum = ref('');

//TODO доп компонент
// import SummaryStats from './SummaryStats.vue';
// import DetailTable from './DetailTable.vue';
// const editingProduct = ref(null);
//
// const openEditModal = (product) => {
//   editingProduct.value = { ...product };
// };
//
// const saveAndClose = async (updatedData) => {
//   // PUT /api/product/:id
//   await axios.patch(`/api/product/${updatedData.id}`, updatedData);
//   // Обновить products.value
//   loadData();
//   editingProduct.value = null;
// };

import SummaryReport from '@/components/SummaryStats.vue';

// const summaryGroups = computed(() => {
//   const groups = {};
//
//   filteredProductsWithRowNumber.value.forEach(p => {
//     // Ключ для группировки
//     const key = `${p.type_izd || 'Без наименования'} ${p.profile || 'Без профиля'}`;
//
//     if (!groups[key]) {
//       groups[key] = {
//         type_izd: p.type_izd || 'Без наименования',
//         profile: p.profile || 'Без профиля',
//         count: 0,
//         sqr: 0,
//         hours: 0,
//         money: 0 // можно рассчитать как hours * ставка
//       };
//     }
//
//     groups[key].count += p.count;
//     groups[key].sqr += p.sqr;
//     groups[key].hours += p.total_time;
//     groups[key].money += 99999999999999;//p.total_time * 600;
//   });
//
//   // Преобразуем в массив и сортируем по площади
//   const regularGroups =Object.values(groups)
//       .sort((a, b) => b.sqr - a.sqr);
//
//
//   // === 3. Сортируем: обычные по площади, кастомные — внизу (по желанию) ===
//   // Если хочешь, чтобы "Холодные окна" была внизу — можно вынести её отдельно
//   // Но пока просто сортируем всё вместе
//   return regularGroups.sort((a, b) => b.sqr - a.sqr);
//
// });


// const customSummaryGroup = computed(()=>{
//     const group = {};
//
//   const regularGroups = Object.values(group);
//
//   const coldWindows = filteredProductsWithRowNumber.value.filter(p =>
//       p.type === 'window' && p.systema === 'х'
//   );
//
//   const hotWindows = filteredProductsWithRowNumber.value.filter(p =>
//       p.type === 'window' && p.systema === 'т'
//   );
//
//   const allWindow = filteredProductsWithRowNumber.value.filter(p =>
//       p.type === "window"
//   )
//
//   const vitrajDoor = filteredProductsWithRowNumber.value.filter(p => {
//     const value = p.type_izd || ''; // на случай null/undefined
//
//     // Приводим к нижнему регистру и убираем лишние пробелы
//     const normalized = value.trim().toLowerCase();
//
//     // Проверяем точное совпадение (рекомендуется)
//     return normalized === 'витраж к двери';
//   });
//
//
//
//   const coldStats = coldWindows.reduce((acc, p) => {
//     acc.count += p.count;
//     acc.sqr += p.sqr;
//     acc.hours += p.total_time;
//     acc.money += 9999999999;//p.total_time * 600;
//     return acc;
//   }, { count: 0, sqr: 0, hours: 0, money: 0 });
//
//   const hotStats = hotWindows.reduce((acc, p) => {
//     acc.count += p.count;
//     acc.sqr += p.sqr;
//     acc.hours += p.total_time;
//     acc.money += 99999999999;//p.total_time * 600;
//     return acc;
//   }, { count: 0, sqr: 0, hours: 0, money: 0 });
//
//   const allStatsWindow = allWindow.reduce((acc, p) =>{
//     acc.count += p.count;
//     acc.sqr += p.sqr;
//     acc.hours += p.total_time;
//     acc.money += 99999999999;//p.total_time * 600;
//     return acc;
//   }, {count: 0, sqr: 0, hours: 0, money: 0 });
//
//   const vitrDoor = vitrajDoor.reduce((acc, p) => {
//     acc.count += p.count;
//     acc.sqr += p.sqr;
//     acc.hours += p.total_time;
//     acc.money += 99999999999;//p.total_time * 600;
//     return acc;
//   }, { count: 0, sqr: 0, hours: 0, money: 0 });
//
//   // Добавляем "виртуальную" группу с особым именем
//   regularGroups.push({
//     type_izd: 'Холодные окна',   // будет в первом столбце
//     profile: 'система: холодная', // пояснение
//     count: coldStats.count,
//     sqr: parseFloat(coldStats.sqr.toFixed(3)),
//     hours: parseFloat(coldStats.hours.toFixed(3)),
//     money: parseFloat(coldStats.money.toFixed(3))
//   });
//
//   regularGroups.push({
//     type_izd: 'Теплые окна',   // будет в первом столбце
//     profile: 'система: теплая', // пояснение
//     count: hotStats.count,
//     sqr: parseFloat(hotStats.sqr.toFixed(3)),
//     hours: parseFloat(hotStats.hours.toFixed(3)),
//     money: parseFloat(hotStats.money.toFixed(3))
//   });
//
//   regularGroups.push({
//     type_izd: 'Все окна',   // будет в первом столбце
//     profile: '', // пояснение
//     count: allStatsWindow.count,
//     sqr: parseFloat(allStatsWindow.sqr.toFixed(3)),
//     hours: parseFloat(allStatsWindow.hours.toFixed(3)),
//     money: parseFloat(allStatsWindow.money.toFixed(3))
//   });
//
//   regularGroups.push({
//     type_izd: 'Витраж к двери',   // будет в первом столбце
//     profile: '', // пояснение
//     count: vitrDoor.count,
//     sqr: parseFloat(vitrDoor.sqr.toFixed(3)),
//     hours: parseFloat(vitrDoor.hours.toFixed(3)),
//     money: parseFloat(vitrDoor.money.toFixed(3))
//   });
//
//   console.log("GGGGGROPOPOK", regularGroups);
//
//   return regularGroups;
// });

// const totalProducts = computed(() => filteredProductsWithRowNumber.value.length);
//
// const totalSqr = computed(() => {
//   return filteredProductsWithRowNumber.value.reduce((sum, p) => sum + p.sqr, 0);
// });
//
// const totalHours = computed(() => {
//   return filteredProductsWithRowNumber.value.reduce((sum, p) => sum + p.total_time, 0);
// });
//
// const totalMoney = computed(() => {
//   return summaryGroups.value.reduce((sum, group) => sum + group.money, 0);
// });


//TODO конец доп компонента

const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const filterFrom = computed(() => {
  return `${year.value}-${String(month.value).padStart(2, '0')}-01`;
});

const filterTo = computed(() => {
  // Последний день месяца: первый день следующего месяца - 1 день
  const nextMonth = new Date(year.value, month.value, 0); // 0 = последний день
  const day = String(nextMonth.getDate()).padStart(2, '0');
  const mm = String(month.value).padStart(2, '0');
  return `${year.value}-${mm}-${day}`;
});

// ========== КОНФИГУРАЦИЯ ТИПОВ ==========
const typeGroups = {
  combined: {
    label: 'Окна и двери',
    types: ['window', 'door']
  },
  loggia: {
    label: 'Лоджии',
    types: ['loggia']
  },
  mosquito_net: {
    label: 'Москитные сетки',
    types: ['ms'] // можно несколько синонимов
  }
};

// Выбранные группы (UI-уровень)
const selectedTypes = ref(['combined', 'loggia', 'mosquito_net']);

// Активные реальные типы (backend-уровень)
const activeBackendTypes = computed(() => {
  const result = [];
  selectedTypes.value.forEach(key => {
    const group = typeGroups[key];
    if (group) {
      result.push(...group.types);
    }
  });

  console.log("TYYYPESSSS", result);
  return result;
});

// ========== ДАННЫЕ ==========
const employees = ref([]);
const products = ref([]);

// ========== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ==========

// Присваиваем порядковые номера
const productsWithRowNumber = computed(() => {
  const list = products.value || []; // ← защита от null/undefined

  const mainItems = list.filter(p => p.part_type === 'main')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const mainIdToRowNumber = new Map();
  mainItems.forEach((item, index) => {
    mainIdToRowNumber.set(item.id, index + 1);
  });

  return list.map(product => {
    let rowNumber = 0;
    if (product.part_type === 'main') {
      rowNumber = mainIdToRowNumber.get(product.id) || 0;
    } else if (product.part_type === 'sub' && product.parent_product_id) {
      rowNumber = mainIdToRowNumber.get(product.parent_product_id) || 0;
    }
    return { ...product, rowNumber };
  });
});

// Фильтруем продукты по выбранным группам
const filteredProductsWithRowNumber = computed(() => {
  const allowedTypes = activeBackendTypes.value;
  if (allowedTypes.length === 0) return [];

  return productsWithRowNumber.value.filter(p => allowedTypes.includes(p.type));
});

// ========== ФОРМАТИРОВАНИЕ ==========
const formatType = (type) => {
  const map = {
    'window': 'Окно',
    'door': 'Дверь',
    'loggia': 'Лоджия',
    'ms': 'Москитная сетка'
  };
  return map[type] || type;
};

const statusType = (status) => {
  const map = {
    'in_production': 'В производстве',
    'assigned': 'Назначены сотрудники',
    'ready': 'Готов'
  };
  return map[status] || status;
};

const getMinutes = (product, employeeId) => {
  const minutes = product.employee_minutes?.[String(employeeId)];
  return minutes ? minutes.toFixed(1) : '';
};

// ========== ЭКСПОРТ В EXCEL ==========
const exportToExcel = async () => {
  function getMonthName(date) {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[date.getMonth()];
  }

  const now = new Date();
  const monthName = getMonthName(now);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Отчёт ПЭО - ${monthName}`);

  const headers = [
    '№', 'Спецификация', '№ заказа', 'корп/дил', 'Заказчик',
    'Вид продукции', 'Система', 'Наименование', 'Профиль',
    'Количество', 'Площадь', 'Н/час', 'Изготовитель', 'Н/руб', 'Защ. Пленки', 'пленка н/р'
  ];

  const employeeNames = employees.value.map(emp => emp.name);
  const allHeaders = [...headers, ...employeeNames];

  const headerRow = worksheet.addRow(allHeaders);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEEEEEE' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  filteredProductsWithRowNumber.value.forEach(prod => {
    const row = [
      prod.rowNumber,
      prod.parent_assembly || '',
      prod.order_num || '',
      prod.customer_type || '',
      prod.customer || '',
      formatType(prod.type),
      prod.systema || '',
      prod.type_izd || '',
      prod.profile || '',
      prod.count || '',
      prod.sqr || '',
      prod.total_time || '',
      'бригада',
      'н/р',
      '',
      ''
    ];

    const employeeMinutes = employees.value.map(emp =>
        getMinutes(prod, emp.id) || ''
    );
    const fullRow = [...row, ...employeeMinutes];
    const excelRow = worksheet.addRow(fullRow);

    excelRow.eachCell((cell) => {
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      if (typeof cell.value === 'string' && cell.value === 'не определено') {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFF0000' } };
      }
    });
  });

  // Подсветка колонки "Н/руб" (индекс 14, 1-based → 14)
  const colIndexNRub = 14;
  worksheet.getColumn(colIndexNRub).eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFFF' } // светло-голубой
    };
    cell.font = { ...cell.font, bold: true };
  });

  // Автоширина
  worksheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const length = cell.value ? String(cell.value).length : 10;
      if (length > maxLength) maxLength = length;
    });
    column.width = Math.min(maxLength + 2, 30);
  });

  // Сохранение
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `peo-report-${now.toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// ========== ЗАГРУЗКА ДАННЫХ ==========
const loadData = async () => {
  try {
    const params = new URLSearchParams();

    // Отправляем каждый активный тип как ?type=...
    activeBackendTypes.value.forEach(type => {
      params.append('type', type);
    });

    // Диапазон дат по месяцу
    params.append('from', filterFrom.value);
    params.append('to', filterTo.value);
    params.append('order_num', orderNum.value);

    const res = await axios.get(`http://localhost:8080/api/alllllll?${params}`);
    employees.value = res.data.employees;
    products.value = res.data.products;

    console.log('Фильтр from:', filterFrom.value);
    console.log('Фильтр to:', filterTo.value);
    console.log('Типы:', activeBackendTypes.value);
    console.log('ZAKAZ:', orderNum.value);

    console.log('Данные загружены:', res.data);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

onMounted(() => {
  loadData(); // первый вызов
});
</script>

<style scoped>
.peo-report {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* Группировка label + input/select */
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.filter-group label {
  font-weight: 500;
  color: #333;
  font-size: 13px;
  min-width: 50px;
  text-align: right;
}

/* Селекты */
.filter-select,
.filter-input {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
  background-color: white;
  transition: border 0.2s ease, box-shadow 0.2s ease;
  min-width: 100px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.filter-input {
  min-width: 120px;
  padding: 6px 10px;
}

/* Чекбоксы — кастомный вид */
.type-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: auto;
  padding-left: 12px;
  border-left: 1px solid #ddd;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-text {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  transition: all 0.2s;
  color: #444;
}

.checkbox-label:hover .checkbox-text {
  border-color: #2563eb;
  color: #1e40af;
  background-color: #eff6ff;
}

.checkbox-input:checked + .checkbox-text {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  color: #2d3748;
}

.report-table th,
.report-table td {
  border: 1px solid #eee;
  padding: 8px 10px;
  text-align: center;
  font-size: 13px;
}

.report-table th {
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  font-weight: 600;
}

td:nth-child(15),
th:nth-child(15) {
  background-color: #ebf8ff !important;
  font-weight: bold;
  color: #2c5282;
}

.employee-col {
  min-width: 60px;
}

.actions {
  text-align: center;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-export:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.btn-export:active {
  transform: translateY(0);
}

.summary-stats {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  font-size: 14px;
}

.summary-stats h4 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 15px;
  font-weight: 600;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-table th,
.summary-table td {
  padding: 8px 10px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.summary-table th {
  background-color: #edf2f7;
  color: #4a5568;
  font-weight: 600;
  font-size: 13px;
  text-transform: none;
}

.summary-table tbody tr:hover {
  background-color: #f7fafc;
}

/* Итоговая строка */
.total-row {
  background-color: #ebf8ff !important;
  border-top: 2px solid #bee3f8;
}

.total-row td {
  font-weight: bold;
  color: #2b6cb0;
  padding: 10px 10px;
}

.cell-warning {
  background-color: #fee;
  color: #c33 !important;
  font-weight: 500;
  border-left: 3px solid #c33;
}

/* Опционально: подсказка при наведении */
.cell-warning:hover {
  background-color: #fdd;
  transition: background-color 0.2s;
}

</style>