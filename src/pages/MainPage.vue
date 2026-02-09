<template>
  <MainLayout>
    <h1 class="welcome">Welcome</h1>

    <div class="summary">
      <div class="card">
        <i class="fa-regular fa-file-lines"></i>
        <div class="label">เอกสารทั้งหมด</div>
        <div class="value">1 Docs</div>
      </div>

      <div class="card success">
        <i class="fa-solid fa-check"></i>
        <div class="label">อนุมัติแล้ว</div>
        <div class="value">1 Docs</div>
      </div>

      <div class="card warning">
        <i class="fa-solid fa-hourglass-half"></i>
        <div class="label">ยังไม่อนุมัติ</div>
        <div class="value">0 Docs</div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
</script>

<style scoped>
.welcome {
  font-size: 28px;
  margin-bottom: 40px;
  color: #444;
}

.summary {
  display: flex;
  gap: 80px;
  justify-content: center;
}

.card {
  text-align: center;
  color: #444;
}

.card i {
  font-size: 42px;
  margin-bottom: 10px;
}

.card.success i {
  color: #2ecc71;
}

.card.warning i {
  color: #f39c12;
}

.value {
  font-weight: 700;
}
</style>
