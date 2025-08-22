<template>
  <div class="print-container">
    <p><strong>Номер заказа:</strong> {{ printData?.order_num }}</p>
    <p><strong>Изделие:</strong> {{ printData?.name }}</p>
    <p><strong>Количество:</strong> {{ printData?.count }}</p>
    <p><strong>Профиль:</strong> {{ printData?.profil }}</p>
    <p><strong>Заказчик:</strong> {{ queryCustomer?.customer }}</p>

    <table border="1" style="width: 100%; margin: 0 0; border-collapse: collapse;">
      <thead>
      <tr style="background: #eee;">
        <th style="width: 50%">Наименование работ</th>
        <th style="width: 10%">Норма (ч)</th>
        <th style="width: 10%">Норма (мин)</th>
        <th style="width: 30%">ФИО исполнителя</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="op in filteredOperations" :key="op.id">
        <td>{{ op.name }}</td>
        <td>{{ op.value.toFixed(3) }}</td>
        <td>{{ (op.value * 60).toFixed(3) }}</td>
        <td></td>
      </tr>

      </tbody>
    </table>
    <table border="1" style="width: 70%; border-collapse: collapse; margin-bottom: 20px;">
      <tr v-if="totalTime > 0" style="font-weight: bold; background-color: #f0f0f0;">
        <td style="width: 50%">Общее время</td>
        <td style="width: 10%">{{ totalTime.toFixed(3) }}</td>
        <td style="width: 10%">{{ (totalTime * 60).toFixed(3) }}</td>
      </tr>
    </table>
    <!-- Новая таблица: Дополнительные работы -->
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
      <tr style="background: #eee;">
        <th style="width: 50%">Доп работы</th>
      </tr>
      </thead>
      <tbody>
      <!-- Три пустые строки для "доп работ" -->
      <tr v-for="n in 3" :key="n">
        <td style="width: 50%">&nbsp;</td>
        <td style="width: 10%">&nbsp;</td>
        <td style="width: 10%">&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      </tbody>
    </table>

    <button @click="print">Печать</button>
  </div>
</template>

    <!-- Print.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import {computed} from "vue";

const route = useRoute()
const printData = ref(null)

const queryCustomer = ref({
  customer: route.query.customer || '',
});

// Функция печати — доступна в шаблоне
const print = () => {
  window.print()
}

// Загрузка данных
const fetchData = async () => {
  //const id = route.query.id
  const id = route.params.id;
  const type = route.query.type;
  console.log("PPPPPPPPPPPPPPPPPPPPPPPPPSASAS", route.params.id);
  if (!id) {
    alert('Не указан ID')
    return
  }

  try {
    const res = await axios.get(`http://localhost:8080/api/orders/order/print/${id}?type=${type}`)
    // Предполагаем, что бэкенд возвращает объект с полем OrderNormData
    printData.value = res.data // ✅ если структура: { OrderNormData: { ... } }
    //console.log("RRRRRRRRRRRRRR", printData.value)
  } catch (err) {
    console.error('Ошибка загрузки:', err)
    //alert('Не удалось загрузить данные')
  }
}

const filteredOperations = computed(() => {
  return printData.value?.operations?.filter(op => op.id !== 'total_time') || []
})

// Вычисляем общее время, если total_time не приходит от бэкенда
const totalTime = computed(() => {
  const totalOp = printData.value?.operations?.find(op => op.id === 'total_time')
  //console.log("TOOOOOOOOTAAAAAAAL", totalOp);
  return totalOp ? totalOp.value : 0
})

// Вызываем при монтировании
onMounted(fetchData)
</script>

<style scoped>
.print-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

@media print {
  button {
    display: none;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-container {
    padding: 1cm;
    font-size: 12pt;
  }
  .no-print {
    display: none !important;
  }
}
</style>


