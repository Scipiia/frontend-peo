<!-- @/components/AdditionalOperationsSection.vue -->
<template>
  <div class="additional-ops">
    <h3 class="additional-ops"><label>Доп работы</label></h3>
    <table class="operations-table">
      <thead>
      <tr>
        <th width="40%">Операция</th>
        <th width="10%">Норма н/час</th>
        <th width="10%">Норма н/мин</th>
        <th>ФИО исполнителя</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="n in 5" :key="n">
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr class="total-row">
        <td colspan="0" class="text-right">
          <strong>Итого доп. работ:</strong>
        </td>
        <td></td>
        <td></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.additional-ops {
  margin-top: 24px;
  font-size: 14px;
}
</style>