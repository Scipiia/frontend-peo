<template>
  <div class="peo-report">
    <!-- Фильтры по типу -->
    <div class="filters">
      <label v-for="type in uniqueTypes" :key="type" class="filter-item">
        <input
            type="checkbox"
            :value="type"
            v-model="selectedTypes"
        />
        {{ formatType(type) }}
      </label>
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
          <td>{{ prod.rowNumber }}</td> <!-- Новый порядковый номер -->
          <td>{{ prod.parent_assembly }}</td>
          <td>{{ prod.order_num }}</td>
          <td>{{ prod.customer_type }}</td>
          <td>{{ prod.customer }}</td>
          <td>{{ formatType(prod.type) }}</td>
          <td>{{ prod.systema }}</td>
          <td>{{ prod.type_izd }}</td>
          <td>{{ prod.profile }}</td>
          <td>{{ prod.count }}</td>
          <td>{{ prod.sqr }}</td>
          <td>{{ prod.total_time }}</td>
          <td>brigada</td>
          <td>rybli</td>
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
        📊 Экспорт в Excel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from "axios";
import ExcelJS from 'exceljs';

// ========== ДАННЫЕ ==========
const employees = ref([]);
const products = ref([]);
const selectedTypes = ref([]);


// Автоматически определяем уникальные типы
const uniqueTypes = computed(() => {
  const types = new Set(products.value.map(p => p.type));
  return Array.from(types).sort();
});

// По умолчанию выбираем все типы
onMounted(() => {
  if (uniqueTypes.value.length > 0) {
    selectedTypes.value = [...uniqueTypes.value];
  }
});

const filteredProductsWithRowNumber = computed(() => {
  const all = productsWithRowNumber.value;
  if (selectedTypes.value.length === 0) return all;
  return all.filter(p => selectedTypes.value.includes(p.type));
});

// Внутри <script setup>
const productsWithRowNumber = computed(() => {
  // Шаг 1: Собираем все main-изделия и присваиваем им номера
  const mainItems = products.value
      .filter(p => p.part_type === 'main')
      .sort((a, b) => a.order_num.localeCompare(b.created_at))
      //.sort((a, b) => a.id - b.id); // или по дате/order_num

  const mainIdToRowNumber = new Map();
  mainItems.forEach((item, index) => {
    mainIdToRowNumber.set(item.id, index + 1);
  });

  // Шаг 2: Формируем итоговый список с номерами
  return products.value.map(product => {
    let rowNumber;
    if (product.part_type === 'main') {
      rowNumber = mainIdToRowNumber.get(product.id) || 0;
    } else if (product.part_type === 'sub') {
      // sub-изделие: ищем номер по parent_product_id
      rowNumber = mainIdToRowNumber.get(product.parent_product_id) || 0;
    } else {
      // На случай других типов — можно присвоить отдельный номер
      rowNumber = 0;
    }

    console.log("AAAAAAAAAAAAA", rowNumber);
    return { ...product, rowNumber };
  });
});



// ========== ФИЛЬТРАЦИЯ ==========
// const filteredProducts = computed(() => {
//   if (selectedTypes.value.length === 0) return products.value;
//   return products.value.filter(p =>
//       selectedTypes.value.includes(p.type)
//   );
// });

console.log(uniqueTypes);
// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
const formatType = (type) => {
  const map = {
    'window': 'Окно',
    'door': 'Дверь',
    'loggia': 'Лоджия'
  };
  return map[type] || type;
};

const statusType = (type) => {
  const map = {
    'in_production': 'В производстве',
    'assigned': 'Назначены сотрудники',
    'ready': 'Готов',
  }
  return map[type] || type;
}

const getMinutes = (product, employeeId) => {
  // employeeId — число, а ключи в JSON — строки
  const minutes = product.employee_minutes[String(employeeId)];
  return minutes ? minutes.toFixed(1) : '';
};

// ========== ЭКСПОРТ В EXCEL ==========
const exportToExcel = async () => {
  // Создаём книгу
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Отчёт ПЭО');

  // Заголовки
  const headers = [
    '№', 'Спецификация', '№ заказа', 'корд/дил', 'Заказчик',
    'Вид продукции', 'Система', 'Наименование', 'Профиль',
    'Количество', 'Площадь', 'Н/час', 'Изготовитель', 'Н/руб', 'Защ. Пленки', 'пленка н/р'
  ];



  // Добавляем сотрудников в заголовки
  const employeeNames = employees.value.map(emp => emp.name);
  const allHeaders = [...headers, ...employeeNames];

  // Устанавливаем заголовки
  worksheet.addRow(allHeaders).eachCell((cell) => {
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

  // Добавляем данные
  filteredProductsWithRowNumber.value.forEach(prod => {
    const row = [
      prod.rowNumber,
      prod.parent_assembly || '',
      prod.order_num || '',
      prod.customer_type || '',
      prod.customer || '',
      formatType(prod.type) || '',
      prod.systema || '',
      prod.type_izd || '',
      prod.profile || '',
      prod.count || '',
      prod.sqr || '',
      prod.total_time || '',
      'бригада',
      '',
      '',
      ''
    ];

    // Добавляем минуты сотрудников
    const employeeMinutes = employees.value.map(emp =>
        getMinutes(prod, emp.id) || ''
    );
    const fullRow = [...row, ...employeeMinutes];

    const excelRow = worksheet.addRow(fullRow);

    // Форматируем ячейки с "не задано"
    excelRow.eachCell((cell) => {
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Проверяем только если значение — строка
      if (typeof cell.value === 'string' && cell.value === 'не определено') {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFF0000' } };
      }
    });
  });

  // === Определяем номера нужных колонок (1-based!) ===
  //const colIndexNChas = headers.indexOf('Н/час') + 1;
  const colIndexNRub = headers.indexOf('Н/руб') + 1;
  const totalRows = worksheet.rowCount;

  // for (let row = 1; row <= totalRows; row++) {
  //   const cell = worksheet.getCell(row, colIndexNChas);
  //   cell.fill = {
  //     type: 'pattern',
  //     pattern: 'solid',
  //     fgColor: { argb: 'FFFFCCCC' } // светло-красный фон
  //
  //   };
  //   // Сохраняем шрифт и границы
  //   cell.font = { size: 10, ...({ bold: true }) };
  //   cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  //   cell.alignment = { vertical: 'middle', horizontal: 'center' };
  // }

  for (let row = 0; row <= totalRows; row++) {
    const cell = worksheet.getCell(row, colIndexNRub);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFFF' } // светло-голубой фон
    };
    cell.font = { size: 10, ...({ bold: true }) };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }


  // Автоширина колонок
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const length = cell.value ? String(cell.value).length : 10;
      if (length > maxLength) maxLength = length;
    });
    column.width = Math.min(maxLength + 2, 30); // макс 30
  });

  // Сохраняем файл
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `peo-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// ========== ПРИМЕР ЗАГРУЗКИ ДАННЫХ ==========
// Замени этот блок на реальный вызов API
onMounted(() => {
  // Пример: имитация загрузки данных
  // В реальности: const res = await api.get('/api/peo-report');
  const loadData = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/alllllll');
      employees.value = res.data.employees;
      products.value = res.data.products;

      console.log("RSSSSS",res.data.products)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  return loadData();
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
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
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

.employee-col {
  min-width: 60px;
}

.actions {
  text-align: center;
}

.btn-export {
  padding: 10px 24px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-export:hover {
  background-color: #1d4ed8;
}
</style>