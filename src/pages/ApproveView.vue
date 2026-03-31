<template>
  <component :is="layoutComponent">
    <section class="approve-shell" :class="{ public: isPublic }">
      <div class="approve-frame">
        <div class="approve-head">
          <div>
            <h2>Approval Detail</h2>
            <p v-if="detail">{{ isPublic ? 'Review the document from the approval email link.' : 'Review the details and take action for this step.' }}</p>
          </div>
          <button class="close-btn" @click="closeView">Close</button>
        </div>

        <div v-if="loading" class="state-card">Loading details...</div>
        <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>

        <div v-else-if="detail" class="detail-shell">
          <div class="doc-type">
            <div class="doc-type-label">Document Type:</div>
            <div class="doc-type-options">
              <label
                v-for="docType in docTypes"
                :key="`doc-type-${docType.Id}`"
                class="radio-pill"
                :class="{ active: activeDocTypeId === docType.Id }"
              >
                <input type="radio" :checked="activeDocTypeId === docType.Id" disabled />
                <span>{{ docType.DocType }}</span>
              </label>
            </div>
          </div>

          <div class="form-section readonly-form">
            <div class="form-grid">
              <div class="form-row">
                <label>Country</label>
                <input :value="detail.Country || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Company</label>
                <input :value="detail.Company || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Business Unit</label>
                <input :value="detail.BusinessUnit || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Date request</label>
                <input :value="formatDateForUI(detail.RequestDate || detail.CreateDate)" readonly />
              </div>
              <div class="form-row">
                <label>Department</label>
                <input :value="detail.Department || detail.RequesterDepartment || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Document No.</label>
                <input :value="displayDocNo" readonly />
              </div>
            </div>

            <div class="textarea-block">
              <label>Project Title Description</label>
              <textarea :value="detail.ProjectTitle || '-'" readonly></textarea>
            </div>

            <div class="form-row spacing-top">
              <label>Pay-in to bank account</label>
              <input :value="detail.BankInfo || '-'" readonly />
            </div>
            <div class="form-row spacing-top">
              <label>Notification e-mail</label>
              <input :value="detail.NotifyEmail || '-'" readonly />
            </div>
            <div class="form-row spacing-top">
              <label>Remark</label>
              <input :value="detail.Remark || '-'" readonly />
            </div>
          </div>

          <div class="item-section">
            <div class="block-head">Items</div>
            <table class="item-table">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 55%">Project Description</th>
                  <th style="width: 10%">Qty</th>
                  <th style="width: 15%">Price</th>
                  <th style="width: 15%">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in detail.Items || []" :key="item.Id || index">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td>{{ item.ItemDescription || '-' }}</td>
                  <td class="text-right-amount">{{ Number(item.Qty || 0) }}</td>
                  <td class="text-right-amount">{{ formatNumber(item.Price) }}</td>
                  <td class="text-right-amount">{{ formatNumber(item.Amount) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-end fw-bold">Total:</td>
                  <td class="text-right-amount fw-bold">{{ formatNumber(detail.Amount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-if="attachmentRows.length" class="attach-section">
            <div class="attach-label">Attach File</div>
            <div v-for="file in attachmentRows" :key="file.name" class="attach-card">
              <div class="file-display">
                <a :href="`${API_BASE}/uploads/${file.name}`" target="_blank" class="file-name">{{ file.name }}</a>
              </div>
            </div>
          </div>

          <div v-if="flowSteps.length" class="flow-section">
            <div class="block-head">Approval Steps</div>
            <div class="flow-panel">
              <div class="flow-inner">
                <div class="flow-track" :style="flowTrackStyle(flowSteps)"></div>
                <div class="flow-grid">
                  <div
                    v-for="step in flowSteps"
                    :key="step.id || `${step.step_no}-${step.approver_id}`"
                    class="flow-node-wrap"
                  >
                    <div class="flow-node" :class="flowNodeClass(step)">
                      <span>{{ flowSymbol(step) }}</span>
                    </div>
                    <div class="flow-text">{{ flowStepLabel(step.step_name) }}</div>
                    <div class="flow-subtext">{{ flowApprover(step) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="detail.Actions?.length" class="history-section">
            <div class="block-head">Approval History</div>
            <table class="item-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="action in detail.Actions" :key="action.action_id">
                  <td>{{ formatDateTime(action.action_at) }}</td>
                  <td>{{ action.ActorName || action.ActorUsername || '-' }}</td>
                  <td>{{ action.action }}</td>
                  <td>{{ action.remark || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="remark-section">
            <label for="remark">Remark</label>
            <textarea
              id="remark"
              v-model="remark"
              placeholder="Enter a remark when rejecting or returning"
              :disabled="!canAct || submitting"
            ></textarea>
          </div>
        </div>

        <div v-if="detail" class="modal-footer">
          <button class="btn green" @click="submitAction('APPROVE')" :disabled="submitting || !canAct">Approve</button>
          <button class="btn orange" @click="submitAction('REJECT')" :disabled="submitting || !canAct">Reject</button>
          <button class="btn blue" @click="submitAction('RETURN')" :disabled="submitting || !canAct">Return</button>
          <button class="btn red" @click="closeView" :disabled="submitting">Close</button>
        </div>
      </div>
    </section>
  </component>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { fetchJson } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const API_BASE = import.meta.env.VITE_API_APP_URL

const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const detail = ref(null)
const remark = ref('')
const docTypes = ref([])

const isPublic = computed(() => Boolean(route.params.token))
const layoutComponent = computed(() => (isPublic.value ? 'div' : MainLayout))
const canAct = computed(() => {
  if (isPublic.value) return Boolean(detail.value?.PublicContext)
  return authStore.can('approval:approve')
})

const activeDocTypeId = computed(() => {
  if (!detail.value) return null
  const value = detail.value.DocTypeId ?? detail.value.DocType
  const numeric = Number(value)
  if (!Number.isNaN(numeric) && docTypes.value.some((item) => item.Id === numeric)) {
    return numeric
  }
  return docTypes.value.find((item) => item.DocType === String(value))?.Id ?? null
})

const attachmentRows = computed(() => {
  if (!detail.value) return []
  return [detail.value.File1, detail.value.File2, detail.value.File3, detail.value.File4]
    .filter(Boolean)
    .map((name) => ({ name }))
})

const displayDocNo = computed(() => normalizeDocNo(detail.value?.DocNo))

const flowSteps = computed(() => {
  if (!detail.value) return []

  const requesterName = detail.value.RequesterName || detail.value.RequesterUsername || '-'
  const createdStep = {
    id: 'requester-start',
    step_no: 0,
    step_name: 'Document Created',
    ApproverName: requesterName,
    ApproverUsername: detail.value.RequesterUsername || requesterName,
    status: 'CREATED',
  }

  const visibleSteps = (detail.value.Steps || []).filter((step) => step.status !== 'SKIPPED')
  return [createdStep, ...visibleSteps]
})

const normalizeDocNo = (value) => {
  const text = String(value || '').trim()
  if (!text) return '-'
  return text.replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ')
}

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatDateForUI = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

const flowStepLabel = (stepName) => {
  const label = String(stepName || '').trim()
  const exactMap = {
    'หัวหน้างานอนุมัติ': 'Manager Approval',
    'เลขานายใหญ่อนุมัติ': 'Director Secretary Approval',
    'Director อนุมัติ': 'Director Approval',
    'CEO อนุมัติ': 'CEO Approval',
    'CFO อนุมัติ': 'CFO Approval',
    'ผู้จัดการบัญชีอนุมัติ': 'Accounting Manager Approval',
    'ผู้จัดการจัดซื้ออนุมัติ': 'Purchasing Manager Approval',
  }

  if (exactMap[label]) return exactMap[label]

  return label
    .replace('หัวหน้างาน', 'Manager')
    .replace('เลขานายใหญ่', 'Director Secretary')
    .replace('ผู้จัดการบัญชี', 'Accounting Manager')
    .replace('ผู้จัดการจัดซื้อ', 'Purchasing Manager')
    .replace('ผู้อำนวยการ', 'Director')
    .replace(/\s*อนุมัติ/g, ' Approval')
    .trim()
}

const flowNodeClass = (step) => {
  if (step.status === 'CREATED') return 'created'
  if (step.status === 'APPROVED') return 'approved'
  if (step.status === 'PENDING') return 'pending'
  if (step.status === 'REJECTED') return 'rejected'
  if (step.status === 'RETURNED') return 'returned'
  if (step.status === 'SKIPPED') return 'skipped'
  return 'waiting'
}

const flowSymbol = (step) => {
  if (step.status === 'CREATED') return '✓'
  if (step.status === 'APPROVED') return '✓'
  if (step.status === 'PENDING') return '•'
  if (step.status === 'REJECTED') return '!'
  if (step.status === 'RETURNED') return '↺'
  if (step.status === 'SKIPPED') return '»'
  return '○'
}

const flowTrackStyle = (steps) => {
  const visibleSteps = Array.isArray(steps) ? steps : []
  if (visibleSteps.length <= 1) {
    return { background: '#c4d9ea' }
  }

  const completedCount = visibleSteps.filter((step) => ['CREATED', 'APPROVED'].includes(step.status)).length
  const progress = Math.max(0, Math.min(100, (completedCount / (visibleSteps.length - 1)) * 100))
  return {
    background: `linear-gradient(90deg, #178f43 0%, #178f43 ${progress}%, #c4d9ea ${progress}%, #c4d9ea 100%)`,
  }
}

const flowApprover = (step) => step.ApproverName || step.ApproverUsername || step.status || '-'

const handleAuthError = (err) => {
  if (err?.status !== 401 || isPublic.value) return false
  authStore.clearAuth()
  router.replace('/')
  return true
}

const loadDocTypes = async () => {
  try {
    const data = await fetchJson(`${API_BASE}/api/doc-types`)
    docTypes.value = (Array.isArray(data) ? data : []).map((item) => ({
      Id: Number(item.Id),
      DocType: item.DocType,
    }))
  } catch (err) {
    console.error('Load doc types failed:', err)
    docTypes.value = []
  }
}

const loadDetail = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const url = isPublic.value
      ? `${API_BASE}/public/approvals/${route.params.token}`
      : `${API_BASE}/api/approvals/${route.params.id}`
    detail.value = await fetchJson(url)
  } catch (err) {
    console.error('Load approval detail failed:', err)
    detail.value = null
    if (!handleAuthError(err)) {
      errorMessage.value =
        isPublic.value && err.message === 'Approval link is invalid or expired'
          ? 'This document has already been approved.'
          : err.message || 'Failed to load document details.'
    }
  } finally {
    loading.value = false
  }
}

const submitAction = async (action) => {
  if (!canAct.value) return
  if ((action === 'REJECT' || action === 'RETURN') && !remark.value.trim()) {
    alert('Please enter a remark before proceeding.')
    return
  }

  submitting.value = true
  try {
    const url = isPublic.value
      ? `${API_BASE}/public/approvals/${route.params.token}/action`
      : `${API_BASE}/api/approvals/${route.params.id}/action`

    await fetchJson(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        remark: remark.value,
      }),
    })

    alert('Approve Successfully')
    remark.value = ''

    if (isPublic.value) {
      errorMessage.value = 'This link has already been used or the document has already been approved.'
      detail.value = null
    } else {
      await loadDetail()
    }
  } catch (err) {
    console.error('Approval action failed:', err)
    if (!handleAuthError(err)) {
      alert(err.message || 'Action failed.')
    }
  } finally {
    submitting.value = false
  }
}

const closeView = () => {
  if (isPublic.value) {
    if (window.opener) {
      window.close()
      return
    }
    if (window.history.length > 1) {
      router.back()
      return
    }
    window.close()
    return
  }
  router.push('/main/waiting')
}

onMounted(async () => {
  await loadDocTypes()
  await loadDetail()
})
</script>

<style scoped>
.approve-shell {
  padding: 24px;
}

.approve-shell.public {
  min-height: 100vh;
  padding: 20px;
  background:
    radial-gradient(circle at top right, rgba(84, 196, 132, 0.14), transparent 28%),
    linear-gradient(180deg, #f7fbf8 0%, #eef6f1 100%);
}

.approve-frame {
  width: min(1280px, 100%);
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #dce7df;
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(23, 143, 67, 0.08);
  overflow: hidden;
}

.approve-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  background: #e6ece9;
}

.approve-head h2 {
  margin: 0;
  font-size: 28px;
  color: #244131;
}

.approve-head p {
  margin: 6px 0 0;
  color: #5f7067;
}

.detail-shell,
.state-card {
  padding: 22px 28px;
  background: #f4f6f5;
}

.state-card {
  text-align: center;
  color: #51645b;
}

.state-card.error {
  color: #b42318;
}

.doc-type {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.doc-type-label {
  min-width: 130px;
  font-size: 14px;
  font-weight: 700;
  color: #214332;
}

.doc-type-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #cfd8d4;
  border-radius: 20px;
  background: #ffffff;
  font-size: 13px;
}

.radio-pill.active {
  border-color: #9bc8ab;
  box-shadow: inset 0 0 0 1px #d6e9dc;
}

.radio-pill input[type='radio'] {
  accent-color: #2e7d32;
}

.form-section {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 40px;
}

.form-row {
  display: flex;
  align-items: center;
}

.form-row label {
  width: 160px;
  margin-right: 12px;
  text-align: right;
  font-weight: 600;
  font-size: 13px;
  color: #214332;
}

.form-row input {
  flex: 1;
  height: 36px;
  padding: 6px 10px;
  border: 1px solid #cfd8d4;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
}

.spacing-top {
  margin-top: 10px;
}

.textarea-block {
  margin: 18px 0;
}

.textarea-block label,
.remark-section label,
.attach-label,
.block-head {
  display: block;
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #214332;
}

.textarea-block textarea,
.remark-section textarea {
  width: 100%;
  min-height: 84px;
  padding: 10px 12px;
  border: 1px solid #cfd8d4;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  resize: vertical;
}

.readonly-form textarea {
  min-height: 88px;
}

.item-section,
.history-section,
.attach-section,
.flow-section,
.remark-section {
  margin-top: 22px;
}

.item-section,
.history-section,
.attach-section,
.flow-section {
  background: #ffffff;
  border: 1px solid #d6e4dc;
  border-radius: 12px;
  padding: 20px;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #d6e4dc;
  border-radius: 8px;
  overflow: hidden;
}

.item-table thead th {
  padding: 10px;
  border: 1px solid #d6e4dc;
  background: #cfe4d8;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.item-table td {
  padding: 8px;
  border: 1px solid #e1ece6;
  font-size: 13px;
}

.item-table tfoot td {
  padding: 10px;
  border: 1px solid #d6e4dc;
  background: #f4f8f6;
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.text-right-amount {
  text-align: right;
  padding-right: 12px;
  font-variant-numeric: tabular-nums;
}

.fw-bold {
  font-weight: 700;
}

.attach-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid #dbe7e0;
  border-radius: 8px;
  background: #ffffff;
}

.file-display {
  flex: 1;
  font-size: 13px;
}

.file-name {
  color: #2e7d32;
  font-weight: 600;
  text-decoration: none;
}

.flow-panel {
  position: relative;
  overflow-x: auto;
}

.flow-inner {
  position: relative;
  display: inline-block;
  width: max-content;
  min-width: max-content;
}

.flow-track {
  position: absolute;
  top: 44px;
  left: 19px;
  right: 19px;
  height: 4px;
  background: #c4d9ea;
}

.flow-grid {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 12px;
  position: relative;
  min-width: max-content;
}

.flow-node-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 190px;
  min-height: 100px;
  text-align: center;
  flex: 0 0 190px;
}

.flow-node {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  color: #fff;
  font-weight: 700;
}

.flow-node.created {
  background: #178f43;
}

.flow-node.approved,
.flow-node.pending {
  background: #2d7dd2;
}

.flow-node.rejected {
  background: #d14343;
}

.flow-node.returned {
  background: #f59e0b;
}

.flow-node.skipped,
.flow-node.waiting {
  background: #94a3b8;
}

.flow-text {
  color: #234131;
  font-weight: 600;
  line-height: 1.35;
  word-break: keep-all;
}

.flow-subtext {
  color: #5f7067;
  font-size: 12px;
}

.remark-section textarea:disabled {
  background: #f3f6f4;
  cursor: not-allowed;
}

.modal-footer {
  padding: 18px;
  background: #e6ece9;
  text-align: center;
}

.btn,
.close-btn {
  padding: 8px 22px;
  border: none;
  border-radius: 22px;
  font-size: 14px;
  cursor: pointer;
}

.btn {
  margin: 0 8px;
  color: #fff;
}

.close-btn {
  background: #ffffff;
  color: #244131;
}

.btn:disabled,
.close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.green {
  background: #2ecc71;
}

.orange {
  background: #f39c12;
}

.blue {
  background: #2d7dd2;
}

.red {
  background: #e74c3c;
}

@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .approve-frame {
    width: 95vw;
  }
}

@media (max-width: 768px) {
  .approve-head {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-shell,
  .state-card {
    padding: 18px 16px;
  }

  .flow-track {
    display: none;
  }
}

@media (max-width: 560px) {
  .approve-shell,
  .approve-shell.public {
    padding: 12px;
  }

  .doc-type,
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row label {
    width: auto;
    margin-right: 0;
    margin-bottom: 6px;
    text-align: left;
  }

  .approve-head,
  .modal-footer {
    padding-inline: 16px;
  }

  .btn,
  .close-btn {
    width: 100%;
    margin: 6px 0;
  }
}
</style>
