import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // ---- ปรับพอร์ต dev server ตรงนี้ ----
    port: 86,          // เปลี่ยนเป็นพอร์ตที่ต้องการ
    strictPort: true,    // ถ้าพอร์ตถูกใช้แล้ว ให้ error ทันที
    host: true,          // เปิดให้เครื่องอื่นในแลนเข้ามาได้ (ถ้าไม่ต้องการให้ลบ)
    open: true,          // เปิดเบราว์เซอร์ให้อัตโนมัติ
    // ถ้ารันหลัง reverse proxy/HTTPS (เช่นผ่าน IIS :443) อาจต้องตั้ง HMR
    // hmr: { host: 'your.domain.com', protocol: 'wss', clientPort: 443 },
  },
})