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

    <!-- После фильтров -->
    <SummaryReport :products="filteredProductsWithRowNumber" />

    <!-- 4. Модальное окно (если нужно редактировать) -->
    <EditProductModal
        v-if="editingProduct"
        :product="editingProduct"
        :employees="employees"
        @close="saveAndClose"
        @cancel="editingProduct = null"
    />

    <!-- Таблица -->
    <div class="table-container">
      <table class="report-table">
        <thead>
        <tr>
          <th>Статус</th>
          <th>Позиция</th>
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
        <tr v-for="prod in filteredProductsWithRowNumber"
            :key="prod.id"
            @click="() => openEditModal(prod)"
            class="clickable-row"
        >
          <td>{{ statusType(prod.status) }}</td>
          <td>{{ prod.position }}</td>
          <td>{{ prod.rowNumber }}</td>
          <td>{{ prod.parent_assembly }}</td>
          <td>{{ prod.order_num }}</td>
          <td
              :class="{
                'profile-empty': prod.customer_type === 'не определено',
                'cell-warning': prod.customer_type === 'не определено'
            }"
          >
            {{ prod.customer_type }}
          </td>
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
          <td
              :class="{
                'profile-empty': prod.brigade === 'не определено',
                'cell-warning': prod.brigade === 'не определено'
            }"
          >
            {{ prod.brigade }}
          </td>
          <td>{{ prod.norm_money }}</td>
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

//TODO модальное окно
const editingProduct = ref(null);
const openEditModal = (product) => {
  // Создаём копию, чтобы не изменять оригинальный объект до сохранения
  editingProduct.value = { ...product };
};

const saveAndClose = async (updatedProduct) => {
  try {
    // PUT /api/product/:id
    console.log("RESULR", updatedProduct);
    const cleanedProduct = {
      ...updatedProduct,
      sqr: parseFloat(updatedProduct.sqr) || 0,
      norm_money: parseFloat(updatedProduct.norm_money) || 0,
      total_time: parseFloat(updatedProduct.total_time) || 0,
      count: parseInt(updatedProduct.count) || 0,
    };

    await axios.put(`http://localhost:8080/api/final/update/${updatedProduct.id}`, cleanedProduct);

    // Обновляем данные в списке
    const index = products.value.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products.value[index] = updatedProduct;
    }

    editingProduct.value = null;
    loadData(); // или просто обнови computed
  } catch (error) {
    console.error('Ошибка сохранения', error);
  }
};
import EditProductModal from "@/components/EditProductModal.vue";
//TODO end

//TODO доп компонент
import SummaryReport from '@/components/SummaryStats.vue';

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
    'final': 'Готов'
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
      prod.sqr || 0,
      prod.total_time || 0,
      prod.brigade || 'не определено',
      prod.norm_money || 0,
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

td:nth-child(16),
th:nth-child(16) {
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

.clickable-row {
  cursor: pointer;
  transition: background-color 0.1s;
}

.clickable-row:hover {
  background-color: #f0f8ff !important;
}

</style>