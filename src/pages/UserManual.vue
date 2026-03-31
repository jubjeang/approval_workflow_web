<template>
  <MainLayout>
    <section class="manual-shell">
      <div class="manual-head">
        <div>
          <div class="eyebrow">Approval Workflow System</div>
          <h1 class="manual-title">{{ currentManual.title }}</h1>
          <p class="manual-subtitle">{{ currentManual.subtitle }}</p>
        </div>
        <div class="head-actions">
          <div class="lang-switch">
            <button :class="{ active: lang === 'th' }" @click="lang = 'th'">TH</button>
            <button :class="{ active: lang === 'en' }" @click="lang = 'en'">EN</button>
          </div>
          <a class="download-btn" :href="downloadHref" download>
            {{ lang === 'th' ? 'Download .docx' : 'Download .docx' }}
          </a>
        </div>
      </div>

      <div class="manual-grid">
        <aside class="manual-nav">
          <div class="nav-title">{{ lang === 'th' ? 'สารบัญ' : 'Contents' }}</div>
          <button
            v-for="section in currentManual.sections"
            :key="section.title"
            class="nav-link"
            @click="scrollToSection(section.id)"
          >
            {{ section.title }}
          </button>
        </aside>

        <main class="manual-content">
          <article
            v-for="section in currentManual.sections"
            :key="section.id"
            :id="section.id"
            class="manual-section"
          >
            <h2>{{ section.title }}</h2>
            <p v-if="section.intro" class="section-intro">{{ section.intro }}</p>

            <ol v-if="section.steps?.length" class="step-list">
              <li v-for="step in section.steps" :key="step">{{ step }}</li>
            </ol>

            <ul v-if="section.bullets?.length" class="bullet-list">
              <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
            </ul>

            <figure v-if="section.image" class="manual-figure">
              <img :src="section.image" :alt="section.caption || section.title" />
              <figcaption>{{ section.caption }}</figcaption>
            </figure>
          </article>
        </main>
      </div>
    </section>
  </MainLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { manualContent, manualDownloads } from '@/content/manualContent'

const lang = ref('en')

const normalizeSections = (sections = []) =>
  sections.map((section, index) => ({
    ...section,
    id: `manual-section-${index + 1}`,
  }))

const manuals = {
  th: {
    ...manualContent.th,
    sections: normalizeSections(manualContent.th.sections),
  },
  en: {
    ...manualContent.en,
    sections: normalizeSections(manualContent.en.sections),
  },
}

const currentManual = computed(() => manuals[lang.value])
const downloadHref = computed(() => manualDownloads[lang.value])

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.manual-shell {
  max-width: 1520px;
  margin: 0 auto;
  padding: 28px 24px 40px;
}

.manual-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 26px 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(122, 214, 157, 0.2), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #f4fbf7 100%);
  border: 1px solid #d7ece0;
  box-shadow: 0 18px 36px rgba(20, 92, 53, 0.08);
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2b8e51;
  margin-bottom: 10px;
}

.manual-title {
  margin: 0 0 10px;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.05;
  color: #123e2c;
}

.manual-subtitle {
  margin: 0;
  max-width: 760px;
  color: #4d695c;
  line-height: 1.65;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.lang-switch {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: #e8f5ec;
  border: 1px solid #d0e6d8;
}

.lang-switch button {
  border: 0;
  background: transparent;
  color: #2b6044;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.lang-switch button.active {
  background: #1c9447;
  color: #ffffff;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: #1a8f45;
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(26, 143, 69, 0.18);
}

.manual-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.manual-nav {
  position: sticky;
  top: 84px;
  padding: 18px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #d7ece0;
  box-shadow: 0 16px 30px rgba(20, 92, 53, 0.06);
}

.nav-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2b8e51;
  margin-bottom: 12px;
}

.nav-link {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  border-radius: 14px;
  padding: 10px 12px;
  color: #244b38;
  font-weight: 600;
  cursor: pointer;
}

.nav-link:hover {
  background: #edf8f1;
}

.manual-content {
  display: grid;
  gap: 22px;
}

.manual-section {
  padding: 22px 24px 26px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid #d7ece0;
  box-shadow: 0 16px 30px rgba(20, 92, 53, 0.06);
}

.manual-section h2 {
  margin: 0 0 12px;
  font-size: 25px;
  color: #123e2c;
}

.section-intro {
  margin: 0 0 12px;
  color: #49685a;
  line-height: 1.7;
}

.step-list,
.bullet-list {
  margin: 0;
  padding-left: 22px;
  color: #244b38;
  line-height: 1.7;
}

.step-list li,
.bullet-list li {
  margin-bottom: 8px;
}

.manual-figure {
  margin: 18px 0 0;
}

.manual-figure img {
  width: 100%;
  display: block;
  border-radius: 18px;
  border: 1px solid #d5e8dc;
  box-shadow: 0 18px 28px rgba(10, 44, 25, 0.08);
}

.manual-figure figcaption {
  margin-top: 10px;
  text-align: center;
  color: #587567;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .manual-grid {
    grid-template-columns: 1fr;
  }

  .manual-nav {
    position: static;
  }
}

@media (max-width: 640px) {
  .manual-shell {
    padding: 18px 14px 30px;
  }

  .manual-head,
  .manual-section {
    padding: 18px;
    border-radius: 18px;
  }

  .head-actions {
    width: 100%;
  }

  .download-btn {
    width: 100%;
  }

  .manual-title {
    font-size: 28px;
  }

  .manual-section h2 {
    font-size: 22px;
  }
}
</style>
