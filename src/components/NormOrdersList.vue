<!-- NormOrdersList.vue -->
<template>
  <div class="norm-orders">
    <h2>Нормированные наряды</h2>

    <div class="filters">
      <div class="filter-group">
        <label>С даты</label>
        <input v-model="filters.from" type="date" @change="applyFilters" />
      </div>

      <div class="filter-group">
        <label>По дату</label>
        <input v-model="filters.to" type="date" @change="applyFilters" />
      </div>

      <div class="filter-group">
        <label>Номер заказа</label>
        <input v-model="filters.orderNum" placeholder="ORD-100" @input="debouncedApplyFilters" />
      </div>

      <div class="filter-group">
        <label>Тип изделия</label>
        <select v-model="filters.type" @change="applyFilters">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Профиль</label>
        <input v-model="filters.profil" placeholder="ALU, PVC..." @input="debouncedApplyFilters" />
      </div>

      <div class="filter-group">
        <label>Название</label>
        <input v-model="filters.name" placeholder="Поиск..." @input="debouncedApplyFilters" />
      </div>

      <button @click="resetFilters" class="btn-reset">Сбросить</button>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="loading">
      Загрузка данных...
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error">
      Ошибка: {{ error }}
    </div>

    <!-- Таблица с данными -->
    <table v-else class="orders-table">
      <thead>
      <tr>
        <th>Тип</th>
        <th>Номер заказа</th>
        <th>Название</th>
        <th>Кол-во</th>
        <th>Профиль</th>
        <th>норма(часы)</th>
        <th>норма(минуты)</th>
        <th>Дата загрузки</th>
        <th>Дата Обновления</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="order in orders" :key="order.result_id">
        <td>{{ getTypeLabel(order.type) }}</td>
        <td>{{ order.order_num }}</td>
        <td>{{ order.name }}</td>
        <td>{{ order.count }}</td>
        <td>{{ order.profil }}</td>
        <td>{{ order.total_time.toFixed(3) }}</td>
        <td>{{ (order.total_time * 60).toFixed(3) }}</td>
        <td>{{ formData(order.created_at) }}</td>
        <td>{{ formData(order.updated_at) }}</td>
      </tr>
      </tbody>
    </table>

    <!-- Нет данных -->
    <div v-if="!loading && !error && orders.length === 0" class="empty">
      Нет данных
    </div>
  </div>
</template>

<script>
export default {
  name: 'NormOrdersList',
  data() {
    return {
      orders: [],
      loading: false,
      error: '',

      // 🔽 НОВОЕ: фильтры
      filters: {
        from: '',        // дата "с" (в формате YYYY-MM-DD)
        to: '',          // дата "по"
        orderNum: '',    // номер заказа
        type: '',        // 'loggia', 'vitraj', 'door', 'window', 'glyhar'
        profil: '',      // профиль
        name: '',        // поиск по названию
      },

      // Для выпадающего списка типов
      typeOptions: [
        { value: '', text: 'Все типы' },
        { value: 'loggia', text: 'Лоджия' },
        { value: 'vitraj', text: 'Витраж' },
        { value: 'door', text: 'Дверь' },
        { value: 'window', text: 'Окно' },
        { value: 'glyhar', text: 'Глухарь' }
      ]
    };
  },
  async mounted() {
    await this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      this.error = '';
      try {
        const response = await fetch('http://localhost:8080/api/norm/orders'); // Убедись, что путь правильный
        const data = await response.json();

        if (data.error) {
          this.error = data.error;
        } else {
          this.orders = data.orders || [];
        }
      } catch (err) {
        this.error = 'Не удалось подключиться к серверу';
        console.error('Fetch error:', err);
      } finally {
        this.loading = false;
      }
    },

    // Удобочитаемое название типа изделия
    getTypeLabel(type) {
      const labels = {
        loggia: 'Лоджия',
        vitraj: 'Витраж',
        door: 'Дверь',
        window: 'Окно',
        glyhar: 'Глухарь',
      };
      return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    },
    formData(dateString) {
      const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', options); // → "8.8.2025"
    }
  },
};
</script>

<style scoped>
.norm-orders {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.loading,
.error,
.empty {
  padding: 20px;
  text-align: center;
  font-style: italic;
  color: #666;
}

.error {
  color: #d32f2f;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.orders-table th,
.orders-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.orders-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.orders-table tr {
  background-color: #f0f8ff;
}

/*.orders-table tr:nth-child(even) {*/
/*  background-color: #fafafa;*/
/*}*/

/*.orders-table tr:hover {*/
/*  background-color: #f0f8ff;*/
/*}*/
</style>