<template>
  <div class="print-container">
    <h1>Нормировочный наряд</h1>

    <p><strong>Номер заказа:</strong> {{ printData?.order_num }}</p>
    <p><strong>Изделие:</strong> {{ printData?.name }}</p>
    <p><strong>Количество:</strong> {{ printData?.count }}</p>
    <p><strong>Профиль:</strong> {{ printData?.profil }}</p>

    <table border="1" style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <thead>
      <tr style="background: #eee;">
        <th>Операция</th>
        <th>Норма (ч)</th>
        <th>Норма (мин)</th>
        <th>ФИО исполнителя</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="op in printData?.operations" :key="op.id">
        <td>{{ op.name }}</td>
        <td>{{ op.value.toFixed(3) }}</td>
        <td>{{ Math.round(op.value * 60) }}</td>
        <td></td>
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
//import router from "@/router";

const route = useRoute()
const printData = ref(null)

// Функция печати — доступна в шаблоне
const print = () => {
  window.print()
}

// Загрузка данных
const fetchData = async () => {
  //const id = route.query.id
  const id = route.params.id
  console.log("PPPPPPPPPPPPPPPPPPPPPPPPPSASAS", route.params.id)
  if (!id) {
    alert('Не указан ID')
    return
  }

  try {
    const res = await axios.get(`http://localhost:8080/api/master/orders/order/${id}`)
    // Предполагаем, что бэкенд возвращает объект с полем OrderNormData
    printData.value = res.data.OrderNormData // ✅ если структура: { OrderNormData: { ... } }
    console.log(res)
  } catch (err) {
    console.error('Ошибка загрузки:', err)
    alert('Не удалось загрузить данные')
  }
}

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
}
</style>


