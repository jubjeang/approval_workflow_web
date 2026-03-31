<template>
  <MainLayout>
    <section class="mail-test-shell">
      <div class="card">
        <h2>Test Send Mail</h2>
        <p>Use this page to test mail delivery directly from the backend.</p>

        <div class="form-row">
          <label for="target-email">Target Email</label>
          <input
            id="target-email"
            v-model.trim="targetEmail"
            type="email"
            placeholder="Leave blank to use the email of the logged-in user"
          />
        </div>

        <div class="actions">
          <button class="btn primary" @click="sendTestMail" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send Test Mail' }}
          </button>
        </div>

        <div v-if="message" class="result" :class="{ error: !success }">
          <pre>{{ message }}</pre>
        </div>
      </div>
    </section>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { fetchJson } from '@/services/api'

const API_BASE = import.meta.env.VITE_API_APP_URL

const targetEmail = ref('')
const loading = ref(false)
const success = ref(false)
const message = ref('')

const sendTestMail = async () => {
  loading.value = true
  message.value = ''

  try {
    const query = targetEmail.value ? `?to=${encodeURIComponent(targetEmail.value)}` : ''
    const result = await fetchJson(`${API_BASE}/api/approvals/test_sendmail${query}`)
    success.value = true
    message.value = JSON.stringify(result, null, 2)
  } catch (err) {
    success.value = false
    message.value = JSON.stringify(
      {
        error: err.message,
        detail: err.data || null,
      },
      null,
      2
    )
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mail-test-shell {
  padding: 24px;
}

.card {
  max-width: 760px;
  padding: 24px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.card h2 {
  margin: 0 0 8px;
  color: #123524;
}

.card p {
  margin: 0 0 20px;
  color: #4b5563;
}

.form-row {
  display: grid;
  gap: 8px;
}

.form-row label {
  font-weight: 600;
  color: #123524;
}

.form-row input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #cfe0d5;
  border-radius: 12px;
}

.actions {
  margin-top: 16px;
}

.btn {
  border: 0;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
}

.btn.primary {
  color: #fff;
  background: #178f43;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 16px;
  border-radius: 14px;
  background: #effaf3;
  color: #123524;
}

.result.error {
  background: #fff1f2;
  color: #9f1239;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
