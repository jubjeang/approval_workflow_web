<template>
  <div class="login-bg">
    <header class="header">
      <img :src="gfcsLogo" alt="GFCS Logo" class="logo" />
    </header>
    <main class="main">
      <section class="form-section">
        <h2 class="title">Approval System</h2>

        <div class="login-card">
          <h3 class="login-title">เข้าสู่ระบบ</h3>

          <form @submit.prevent="handleLogin" class="pretty-form">
            <!-- Username -->
            <div class="row">
              <div class="label-col">Username</div>
              <div class="control-col">
                <div
                  class="control"
                  :class="{ 'is-disabled': isLoading, 'is-invalid': !!usernameErr }"
                >
                  <span class="ctrl-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        fill="currentColor"
                        d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"
                      />
                    </svg>
                  </span>
                  <input
                    id="username"
                    type="text"
                    v-model="username"
                    autocomplete="username"
                    :disabled="isLoading"
                    placeholder="กรอกชื่อผู้ใช้"
                    :aria-invalid="!!usernameErr"
                    @input="usernameErr = ''"
                    @keyup.enter.prevent="focusPass()"
                  />
                </div>
                <p v-if="usernameErr" class="err-text">{{ usernameErr }}</p>
              </div>
            </div>

            <!-- Password -->
            <div class="row">
              <div class="label-col">Password</div>
              <div class="control-col">
                <div
                  class="control"
                  :class="{ 'is-disabled': isLoading, 'is-invalid': !!passwordErr }"
                >
                  <span class="ctrl-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        fill="currentColor"
                        d="M12 1a5 5 0 00-5 5v3H5a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V10a1 1 0 00-1-1h-2V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z"
                      />
                    </svg>
                  </span>

                  <input
                    ref="passRef"
                    :type="showPass ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    autocomplete="current-password"
                    :disabled="isLoading"
                    placeholder="กรอกรหัสผ่าน"
                    :aria-invalid="!!passwordErr"
                    @input="passwordErr = ''"
                    @keyup.enter.prevent="handleLogin"
                  />

                  <button
                    type="button"
                    class="ctrl-append"
                    :disabled="isLoading"
                    :title="showPass ? 'ซ่อนรหัส' : 'แสดงรหัส'"
                    :aria-pressed="showPass ? 'true' : 'false'"
                    @click="showPass = !showPass"
                  >
                    <svg
                      v-if="!showPass"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-2.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                      />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M3.707 2.293L2.293 3.707l3.092 3.092C3.616 8.042 2 12 2 12s3.367 7 10 7c2.289 0 4.182-.6 5.713-1.48l3.287 3.287 1.414-1.414L3.707 2.293zM12 17c-4.411 0-7.156-3.379-8.284-5 .517-.75 1.34-1.8 2.519-2.736l2.23 2.23A5 5 0 0012 17zm0-10c4.411 0 7.156 3.379 8.284 5-.384.557-.938 1.3-1.67 2.02l-2.29-2.29A5 5 0 0012 7z"
                      />
                    </svg>
                  </button>
                </div>
                <p v-if="passwordErr" class="err-text">{{ passwordErr }}</p>
              </div>
            </div>

            <button type="submit" class="login-btn" :disabled="isLoading">
              <span v-if="!isLoading">เข้าสู่ระบบ</span>
              <span v-else>กำลังตรวจสอบ...</span>
            </button>
          </form>
        </div>
      </section>
    </main>

    <!-- Loading Overlay -->
    <transition name="fade-fast">
      <div v-if="isLoading" class="overlay" aria-busy="true" aria-live="polite">
        <div class="loader-wrap">
          <div class="spinner"></div>
          <div class="loader-text">กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...</div>
        </div>
      </div>
    </transition>

    <!-- Error Backdrop -->
    <transition name="fade-fast">
      <div
        v-if="showError"
        class="error-backdrop"
        @click.self="dismissError"
        @keydown.esc="dismissError"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div class="error-card" role="alert">
          <div class="error-head">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11.001 10h2v5h-2zM11 16h2v2h-2z"></path>
              <path
                d="M1 21h22L12 2 1 21z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              ></path>
            </svg>
            <strong>{{ errorTitle }}</strong>
          </div>
          <p class="error-body">{{ errorMsg }}</p>
          <button class="error-close" @click="dismissError">ปิด</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router' // ⬅️ ใช้ router/route
import axios from 'axios'
import gfcsLogo from '@/assets/images/gfcs_logo_green.png'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const passRef = ref(null)

const usernameErr = ref('')
const passwordErr = ref('')

const showPass = ref(false)
const isLoading = ref(false)
const showError = ref(false)
const errorMsg = ref('')
const errorTitle = ref('ไม่สามารถเข้าสู่ระบบได้')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const pickMessage = (data) => {
  try {
    if (!data) return ''
    if (typeof data === 'string') {
      const text = data
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      return text.slice(0, 400)
    }
    if (typeof data.message === 'string') return data.message
    if (typeof data.msg === 'string') return data.msg
    if (typeof data.error_message === 'string') return data.error_message
    if (typeof data.error === 'string') return data.error
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.errors) && data.errors.length) {
      const e0 = data.errors[0]
      return typeof e0 === 'string' ? e0 : e0?.message || e0?.detail || ''
    }
    if (data.error && typeof data.error === 'object') return pickMessage(data.error)
    return ''
  } catch {
    return ''
  }
}

const extractErrorShape = (err) => {
  let status, message
  if (err?.response) {
    status = err.response.status
    message = pickMessage(err.response.data) || err.response.statusText || ''
  } else if (err?.data) {
    status = err.status
    message = pickMessage(err.data)
  } else if (typeof err === 'string') {
    message = err
  } else if (err?.message) {
    message = err.message
  }
  return { status, message }
}

const normalizeNonAuthMessage = (info) => {
  const m = (info.message || '').trim()
  if ((info.status && info.status >= 500) || /^internal server error$/i.test(m)) {
    return 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง'
  }
  if (m) return m
  return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง'
}

const dismissError = () => {
  showError.value = false
}
const showNiceError = (message, title = 'ไม่สามารถเข้าสู่ระบบได้') => {
  errorTitle.value = title
  errorMsg.value = message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
  showError.value = true
}

const focusPass = () => passRef.value?.focus()

function validateInputs() {
  usernameErr.value = ''
  passwordErr.value = ''

  const u = username.value.trim()
  const p = password.value

  if (!u && !p) {
    usernameErr.value = 'กรุณากรอกชื่อผู้ใช้'
    passwordErr.value = 'กรุณากรอกรหัสผ่าน'
    showNiceError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
    return false
  }
  if (!u) {
    usernameErr.value = 'กรุณากรอกชื่อผู้ใช้'
    showNiceError('กรุณากรอกชื่อผู้ใช้')
    return false
  }
  if (!p) {
    passwordErr.value = 'กรุณากรอกรหัสผ่าน'
    showNiceError('กรุณากรอกรหัสผ่าน')
    return false
  }
  username.value = u
  return true
}

const handleLogin = async () => {
  if (isLoading.value) return
  if (!validateInputs()) {
    if (usernameErr.value) {
      document.getElementById('username')?.focus()
    } else if (passwordErr.value) {
      passRef.value?.focus()
    }
    return
  }

  showError.value = false
  errorMsg.value = ''
  isLoading.value = true

  const minLoad = sleep(350)

  // 1) AUTH (AD)
  try {
    const res = await axios.post(import.meta.env.VITE_API_APP_URL + '/auth_ad', {
      username: username.value,
      password: password.value,
    })
    if (!res.data?.success) {
      await minLoad
      isLoading.value = false
      showNiceError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      return
    }
  } catch (err) {
    await minLoad
    isLoading.value = false
    if (!err?.response) showNiceError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง')
    else showNiceError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    return
  }

  // 2) GETUSER (แปลงผลลัพธ์ให้เป็น object เสมอ)
  try {
    const APP_ID = import.meta.env.VITE_APP_ID // ✅ ต้องขึ้นต้นด้วย VITE_
    //http://vrf.gfcs.co.th:4002
    const resUser = await axios.post(import.meta.env.VITE_API_VALIDATE_USER_URL + '/getuserinfo', {
      username: username.value,
      password: password.value,
      app_id: APP_ID,
    })

    // normalize: รองรับ object / [obj] / [[obj]]
    const raw = resUser.data
    const user = Array.isArray(raw) ? (Array.isArray(raw[0]) ? raw[0][0] : raw[0]) : raw

    if (!user?.username) {
      await minLoad
      isLoading.value = false
      showNiceError('ชื่อผู้ใช้ยังไม่ถูกลงทะเบียนในระบบ')
      return
    }

    // ✅ เก็บข้อมูลผู้ใช้ + token
    localStorage.setItem('user', JSON.stringify(user))
    const opaqueToken = `ok.${Date.now().toString(36)}.${encodeURIComponent(user.username)}`
    localStorage.setItem('authToken', opaqueToken)
  } catch (err) {
    await minLoad
    const info = extractErrorShape(err)
    isLoading.value = false
    showNiceError(normalizeNonAuthMessage(info))
    return
  }

  await minLoad
  isLoading.value = false

  // debug เล็กน้อย
  console.log('authToken =', localStorage.getItem('authToken'))
  console.log('user =', localStorage.getItem('user'))

  // ✅ redirect กลับหน้าที่ตั้งไว้ (หรือ /main)
  const redirect = (route.query.redirect && String(route.query.redirect)) || '/main'
  router.replace(redirect)
}
</script>


<style scoped>
/* ===== Base layout ===== */
.login-bg {
  min-height: 100vh;
  min-width: 100vw;
  height: 100vh;
  width: 100vw;
  background: #f6f8f9;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100vw;
  height: clamp(60px, 8vh, 88px);
  background: linear-gradient(90deg, #178f43 70%, #98e2aa 100%);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: clamp(12px, 2vw, 32px);
  box-sizing: border-box;
}

.logo {
  height: clamp(36px, 6vh, 64px);
  object-fit: contain;
}

/* ⬆️ ย้ายโซนแดงขึ้นบน: จัดชิดบน + padding-top เล็กน้อย (responsive) */
.main {
  flex: 1;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* เดิม center */
  padding-top: clamp(16px, 9vh, 120px);
  /* ระยะจากแถบเขียวด้านบน */
}

/* ===== Fluid sizing tokens (การ์ด + ฟอร์ม) ===== */
.login-card {
  width: clamp(480px, 36vw, 760px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  padding: clamp(20px, 3vw, 32px) clamp(18px, 2.5vw, 28px);
  margin: 0 auto;
}

.form-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  text-align: center;
  color: #178f43;
  font-weight: 700;
  font-style: italic;
  font-size: clamp(2.1rem, 2.4vw, 3.2rem);
  margin-bottom: clamp(18px, 2.6vh, 30px);
  margin-top: 0;
}

.login-title {
  text-align: center;
  color: #2c2c2c;
  font-weight: 800;
  font-size: clamp(1rem, 1.05vw, 1.3rem);
  margin-bottom: clamp(10px, 1.8vh, 18px);
}

/* ===== Pretty form ===== */
.pretty-form {
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.6vh, 16px);
}

.row {
  display: grid;
  grid-template-columns: clamp(110px, 12vw, 160px) 1fr;
  align-items: center;
  gap: clamp(10px, 1.4vw, 14px);
}

.label-col {
  justify-self: end;
  font-weight: 700;
  color: #2d3748;
  font-size: clamp(0.95rem, 0.9vw, 1.05rem);
}

.control-col {
  width: 100%;
}

/* control */
.control {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: clamp(8px, 1.1vh, 12px) clamp(12px, 1.2vw, 16px) clamp(8px, 1.1vh, 12px)
    clamp(40px, 3vw, 48px);
  min-height: clamp(40px, 6vh, 54px);
  transition: border-color 0.15s, box-shadow 0.15s, background 0.2s;
}

.control:is(:focus-within) {
  border-color: #178f43;
  box-shadow: 0 0 0 4px #178f4325;
}

.control.is-disabled {
  opacity: 0.7;
}

.control.is-invalid {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.18);
}

.ctrl-icon {
  position: absolute;
  left: clamp(12px, 1.2vw, 14px);
  top: 50%;
  transform: translateY(-50%);
  color: #7a8895;
  display: inline-grid;
  place-items: center;
}

.control input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: clamp(0.98rem, 1vw, 1.12rem);
  color: #1f2937;
  padding: 0;
  margin: 0;
}

/* error text (ใต้ช่อง) */
.err-text {
  margin-top: 6px;
  color: #e53e3e;
  font-size: 0.88rem;
}

.ctrl-append {
  display: inline-grid;
  place-items: center;
  border: none;
  background: #2f4858;
  color: #fff;
  padding: clamp(6px, 0.9vh, 8px) clamp(10px, 1vw, 12px);
  border-radius: 10px;
  margin-left: clamp(8px, 1vw, 12px);
  cursor: pointer;
  transition: opacity 0.18s, transform 0.06s;
}

.ctrl-append:hover {
  opacity: 0.92;
}

.ctrl-append:active {
  transform: scale(0.98);
}

.ctrl-append:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* submit */
.login-btn {
  margin-top: clamp(6px, 1vh, 10px);
  width: 100%;
  background: #1490ee;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: clamp(11px, 1.3vh, 14px) 0;
  font-size: clamp(1rem, 1vw, 1.12rem);
  font-weight: 800;
  cursor: pointer;
  transition: background 0.18s, opacity 0.18s;
}

.login-btn:hover {
  background: #007ed8;
}

.login-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

/* ===== Loading / Error ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.loader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 22px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #eee;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e3e3e3;
  border-top-color: #178f43;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.loader-text {
  color: #2b2b2b;
  font-weight: 600;
  font-size: 0.98rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.16);
  z-index: 1100;
  display: grid;
  place-items: start center;
  padding-top: 10vh;
}

.error-card {
  width: min(520px, 92vw);
  background: #fff;
  border: 1px solid #ffd7d7;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  border-radius: 14px;
  padding: 18px;
}

.error-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #cc2e2e;
  font-weight: 700;
  margin-bottom: 6px;
}

.error-body {
  margin: 6px 0 12px;
  color: #333;
  line-height: 1.5;
}

.error-close {
  margin-left: auto;
  background: #cc2e2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.18s;
}

.error-close:hover {
  opacity: 0.9;
}

/* ===== Transitions ===== */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.18s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

/* ===== Breakpoints ===== */
@media (max-width: 900px) {
  .login-card {
    width: min(92vw, 600px);
  }

  .row {
    grid-template-columns: clamp(96px, 26vw, 132px) 1fr;
  }
}

@media (max-width: 640px) {
  .login-card {
    width: 92vw;
    padding: 18px 16px;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .label-col {
    justify-self: start;
    margin-bottom: 6px;
  }

  .control {
    padding-left: clamp(38px, 8vw, 48px);
  }

  .main {
    padding-top: clamp(12px, 7vh, 80px);
  }

  /* มือถือให้ขึ้นมาใกล้หัวมากขึ้น */
}
</style>
