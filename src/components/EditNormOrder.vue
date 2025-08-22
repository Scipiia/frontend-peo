<!-- EditNormOrder.vue -->
<template>
  <div class="edit-norm-order">
    <h2>Редактирование нормировки</h2>

    <div v-if="loading">Загрузка данных...</div>
    <div v-else-if="error" class="alert alert-danger">
      Ошибка: {{ error }}
    </div>
    <div v-else>
      <div class="mb-3">
<!--        <input v-model="form.order_num" class="form-control" type="text" readonly />-->
        <p><strong>Номер заказа:</strong> {{ form.order_num }}</p>
      </div>

      <div class="mb-3">
        <p><strong>Название: </strong> {{ form.name }}</p>
      </div>

      <div class="mb-3">
        <label><strong>Итого (мин)</strong></label>
        <input
            :value="totalTime"
            class="form-control"
            readonly
            style="font-size: 1.1em; background: #f0f0f0; color: #111;"
        />
      </div>

      <table class="table table-bordered">
        <thead>
        <tr>
          <th>Операция</th>
          <th>Норма времени (мин)</th>
          <th>Кол-во</th>
          <th>Итого (часов)</th>
          <th>Итого (мин)</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(op, index) in form.operations" :key="index">
          <td>{{ op.name }}</td>
          <td>
            <input
                v-model.number="op.time"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
            />
          </td>
          <td>{{ op.count }}</td>
          <td>{{ (op.time || 0).toFixed(3) }}</td>
          <td>{{ (op.time * 60 || 0).toFixed(3) }}</td>
        </tr>
        </tbody>
      </table>

      <div class="d-flex gap-2">
        <button @click="saveChanges" class="btn btn-success">Сохранить изменения</button>
        <router-link to="/api/norm/orders/" class="btn btn-secondary">Назад к списку</router-link>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      loading: true,
      error: null,
      form: {
        order_num: '',
        name: '',
        count: 1,
        profil: '',
        type: '',
        operations: []
      }
    };
  },
  async mounted() {
    await this.loadOrderData();
  },
  computed: {
    totalTime() {
      return this.form.operations
          .filter(op => op.id !== 'total_time')
          .reduce((sum, op) => sum + (parseFloat(op.time) || 0), 0)
          .toFixed(2);
    }
  },

  methods: {
    async loadOrderData() {
      this.loading = true;
      this.error = null;

      const id = this.$route.params.id;
      const type = this.$route.query.type;

      console.log(id, type);
      console.log(this.$route);

      if (!id || !type) {
        this.error = 'Не хватает ID или типа изделия';
        this.loading = false;
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/norm/orders/order/edit/${id}?type=${type}`);
        if (!response.ok) throw new Error('Не удалось загрузить данные');

        const data = await response.json();

        console.log("DDDDDAAAARA", data)

        // Маппим данные в форму
        this.form = {
          order_num: data.order_num || '—',
          name: data.name || '—',
          count: data.count || 1,
          profil: data.profil || '',
          operations: (data.operations || [])
              .filter(op=>op.id !== 'total_time')
              .map(op => ({
                id: op.id,
                name: op.name,
                time: parseFloat(op.value) || 0,  // ← БЫЛО: op.time_per_unit, СТАЛО: op.value
                count: data.count || 1                  // ← количество берём из заказа
          }))
        };
      } catch (err) {
        this.error = 'Ошибка загрузки данных: ' + err.message;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async saveChanges() {
      if (!confirm('Сохранить изменения нормировки?')) return;

      const id = parseInt(this.$route.params.id);
      const type = this.$route.query.type;
      const order_num = this.form.order_num;
      const totalTime = this.totalTime;
      console.log("DDDDAAAsdfsdf", this.form.order_num);

      // Формируем операции в том формате, который ожидает сервер
      const updatedOperations = this.form.operations.map(op => ({
        id: op.id,
        value: op.time // ← отправляем как `value`
      }));

      console.log('Отправляю данные:', {
        id,
        type,
        order_num,
        operations: updatedOperations,
        totalTime
      });

      try {
        const response = await fetch(`http://localhost:8080/api/norm/orders/order/edit/${id}?type=${type}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            type,
            order_num,
            operations: updatedOperations  // ← только id и value
          })
        });


        const result = await response.json();


        if (response.ok) {
          alert('Нормировка успешно обновлена');
        } else {
          alert('Ошибка: ' + (result.error || 'неизвестная ошибка'));
        }
      } catch (err) {
        alert('Ошибка сети: ' + err.message);
        console.error(err);
      }
    }
  }
};
</script>

<style scoped>
.edit-norm-order {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.form-control {
  padding: 8px;
  font-size: 14px;
}
.btn {
  padding: 10px 16px;
}
</style>