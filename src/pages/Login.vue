<template>
  <div class="login-bg">
    <header class="header">
      <img :src="logo" alt="GFCS Logo" class="logo" />
    </header>

    <main class="main">
      <section class="form-section">
        <h2 class="title">Approval System</h2>

        <div class="login-card">
          <h3 class="login-title">Sign In</h3>

          <form @submit.prevent="handleLogin" class="pretty-form">
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
                    placeholder="Enter username"
                    :aria-invalid="!!usernameErr"
                    @input="usernameErr = ''"
                    @keyup.enter.prevent="focusPass"
                  />
                </div>
                <p v-if="usernameErr" class="err-text">{{ usernameErr }}</p>
              </div>
            </div>

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
                    placeholder="Enter password"
                    :aria-invalid="!!passwordErr"
                    @input="passwordErr = ''"
                    @keyup.enter.prevent="handleLogin"
                  />

                  <button
                    type="button"
                    class="ctrl-append"
                    :disabled="isLoading"
                    :title="showPass ? 'Hide password' : 'Show password'"
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
              <span v-if="!isLoading">Sign In</span>
              <span v-else>Checking...</span>
            </button>
          </form>
        </div>
      </section>
    </main>

    <transition name="fade-fast">
      <div v-if="isLoading" class="overlay" aria-busy="true" aria-live="polite">
        <div class="loader-wrap">
          <div class="spinner"></div>
          <div class="loader-text">Verifying your sign-in information...</div>
        </div>
      </div>
    </transition>

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
          <button class="error-close" @click="dismissError">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import logo from '@/assets/images/gfcs_logo_green.png'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const passRef = ref(null)

const usernameErr = ref('')
const passwordErr = ref('')
const showPass = ref(false)
const isLoading = ref(false)
const showError = ref(false)
const errorMsg = ref('')
const errorTitle = ref('Unable to sign in')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const dismissError = () => {
  showError.value = false
}

const showNiceError = (message, title = 'Unable to sign in') => {
  errorTitle.value = title
  errorMsg.value = message || 'An unknown error occurred.'
  showError.value = true
}

const focusPass = () => passRef.value?.focus()

const validateInputs = () => {
  usernameErr.value = ''
  passwordErr.value = ''

  const u = username.value.trim()
  const p = password.value

  if (!u && !p) {
    usernameErr.value = 'Please enter your username.'
    passwordErr.value = 'Please enter your password.'
    showNiceError('Please enter your username and password.')
    return false
  }

  if (!u) {
    usernameErr.value = 'Please enter your username.'
    showNiceError('Please enter your username.')
    return false
  }

  if (!p) {
    passwordErr.value = 'Please enter your password.'
    showNiceError('Please enter your password.')
    return false
  }

  username.value = u
  return true
}

const handleLogin = async () => {
  if (isLoading.value) return
  if (!validateInputs()) {
    if (usernameErr.value) document.getElementById('username')?.focus()
    else if (passwordErr.value) passRef.value?.focus()
    return
  }

  showError.value = false
  errorMsg.value = ''
  isLoading.value = true
  const minLoad = sleep(350)

  try {
    const authRes = await axios.post(`${import.meta.env.VITE_API_APP_URL}/auth_ad`, {
      username: username.value,
      password: password.value,
    })

    if (!authRes.data?.success) {
      await minLoad
      isLoading.value = false
      showNiceError('Invalid username or password.')
      return
    }
  } catch (err) {
    await minLoad
    isLoading.value = false
    showNiceError(
      err?.response?.data?.message ||
        'Unable to connect to the authentication server. Please try again.'
    )
    return
  }

  try {
    const resUser = await axios.post(`${import.meta.env.VITE_API_APP_URL}/getuserinfo`, {
      username: username.value,
      app_id: import.meta.env.VITE_APP_ID,
    })

    const { user: userData, access_token } = resUser.data

    if (!userData?.username) {
      await minLoad
      isLoading.value = false
      showNiceError('User account is not registered for this application')
      return
    }

    authStore.setAuth(userData, access_token)
  } catch (err) {
    await minLoad
    isLoading.value = false
    const msg = err?.response?.data?.message || 'Unable to load user data.'
    showNiceError(msg)
    return
  }

  await minLoad
  isLoading.value = false

  const redirect = (route.query.redirect && String(route.query.redirect)) || '/main'
  router.replace(redirect)
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  min-height: 100dvh;
  min-width: 320px;
  background: #f6f8f9;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  height: clamp(60px, 8vh, 88px);
  background: linear-gradient(90deg, #178f43 70%, #98e2aa 100%);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: clamp(12px, 2vw, 32px);
  box-sizing: border-box;
}

.logo {
  height: 38px;
  object-fit: contain;
}

.main {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: clamp(32px, 10vh, 96px);
  padding-bottom: 24px;
  padding-inline: 16px;
}

.login-card {
  width: min(100%, 760px);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  padding: clamp(22px, 2.4vw, 36px);
}

.form-section {
  width: min(92vw, 920px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  margin: 0 0 16px;
  font-size: clamp(26px, 2.6vw, 36px);
  color: #1f5130;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: center;
}

.login-title {
  margin: 0 0 24px;
  text-align: center;
  font-size: 22px;
  color: #243b2c;
}

.pretty-form {
  display: grid;
  gap: 18px;
}

.row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
}

.label-col {
  font-weight: 700;
  color: #23362a;
}

.control-col {
  min-width: 0;
}

.control {
  display: grid;
  grid-template-columns: 44px 1fr 52px;
  align-items: center;
  border: 1px solid #d3d8dd;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.control input {
  height: 54px;
  border: none;
  outline: none;
  padding: 0 10px;
  font-size: 16px;
}

.ctrl-icon,
.ctrl-append {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6a7780;
}

.ctrl-append {
  width: 52px;
  min-width: 52px;
  height: 100%;
  border: none;
  background: #31414f;
  color: #fff;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.ctrl-append svg {
  display: block;
}

.is-invalid {
  border-color: #e14b4b;
}

.is-disabled {
  opacity: 0.7;
}

.err-text {
  margin: 8px 0 0;
  color: #c0392b;
  font-size: 13px;
}

.login-btn {
  height: 56px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(90deg, #2f72bf, #2d8de0);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.login-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.overlay,
.error-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 41, 55, 0.28);
  z-index: 1000;
}

.loader-wrap,
.error-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
}

.loader-wrap {
  padding: 30px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 4px solid #dce8de;
  border-top-color: #178f43;
  animation: spin 0.9s linear infinite;
}

.loader-text {
  color: #244131;
  font-weight: 600;
}

.error-card {
  width: min(92vw, 520px);
  padding: 22px 24px;
  border: 1px solid #ffd4ce;
}

.error-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d14343;
  margin-bottom: 12px;
}

.error-body {
  margin: 0 0 16px;
  color: #2f3440;
  line-height: 1.7;
  word-break: break-word;
}

.error-close {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  background: #d14343;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.18s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .main {
    padding-top: 24px;
  }

  .login-card {
    padding: 20px 16px;
    border-radius: 16px;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .label-col {
    margin-bottom: 6px;
  }

  .control {
    grid-template-columns: 40px 1fr 48px;
  }

  .ctrl-append {
    width: 48px;
    min-width: 48px;
  }

  .control input {
    height: 50px;
    font-size: 15px;
  }
}
</style>
