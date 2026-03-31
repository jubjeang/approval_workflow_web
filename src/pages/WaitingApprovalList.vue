<template>
  <MainLayout>
    <section class="page-shell">
      <div class="page-head">
        <div>
          <h2 class="page-title">Pending Approvals</h2>
          <p class="page-subtitle">Documents waiting for your action in the current workflow step.</p>
        </div>
        <button class="refresh-btn" @click="loadData" :disabled="loading">Refresh</button>
      </div>

      <div v-if="loading" class="state-card">Loading data...</div>
      <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>
      <div v-else>
        <div class="search-section">
          <div class="search-grid">
            <div class="search-field keyword-field inline-field">
              <label for="waiting-search">Search</label>
              <div class="field-control">
                <input
                  id="waiting-search"
                  v-model.trim="searchText"
                  type="text"
                  placeholder="Search document no., title, requester, or department"
                  @keyup.enter="applySearch"
                />
              </div>
            </div>
            <div class="search-field status-field inline-field">
              <label for="waiting-status-filter">Status</label>
              <div class="field-control">
                <select id="waiting-status-filter" v-model="statusFilter">
                  <option value="">All</option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </div>
            </div>
            <div class="search-action">
              <button class="search-btn" type="button" @click="applySearch" aria-label="Search">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10 4a6 6 0 104.472 10.001l4.763 4.764 1.414-1.414-4.764-4.763A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th @click="sortBy('DocNo')">
                  Document No.
                  <span class="sort-icon" v-if="sortKey === 'DocNo'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('DocType')">
                  Document Type
                  <span class="sort-icon" v-if="sortKey === 'DocType'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('ProjectTitle')">
                  Project Title
                  <span class="sort-icon" v-if="sortKey === 'ProjectTitle'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('RequesterName')">
                  Requester
                  <span class="sort-icon" v-if="sortKey === 'RequesterName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('RequesterDepartment')">
                  Department
                  <span class="sort-icon" v-if="sortKey === 'RequesterDepartment'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('Amount')">
                  Amount
                  <span class="sort-icon" v-if="sortKey === 'Amount'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('StepName')">
                  Step
                  <span class="sort-icon" v-if="sortKey === 'StepName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedRows.length === 0">
                <td colspan="8" class="no-data">No pending approvals</td>
              </tr>
              <tr
                v-for="row in paginatedRows"
                :key="`${row.Id}-${row.StepId}`"
                @click="openApproval(row)"
              >
                <td>{{ row.DocNo || '-' }}</td>
                <td>{{ row.DocType || '-' }}</td>
                <td>{{ row.ProjectTitle || '-' }}</td>
                <td>{{ row.RequesterName || row.RequesterUsername || '-' }}</td>
                <td>{{ row.RequesterDepartment || '-' }}</td>
                <td class="text-right-amount">{{ formatNumber(row.Amount) }}</td>
                <td>{{ row.StepName || '-' }}</td>
                <td class="action-col">
                  <button class="icon-btn open-btn" @click.stop="openApproval(row)">Open</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="page-summary">Showing {{ rangeStart }}-{{ rangeEnd }} of {{ filteredRows.length }}</div>
          <div class="page-controls">
            <label>Total:
              <select v-model="pageSize">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
              </select>
            </label>
            <label>Go to page:
              <select v-model.number="currentPage">
                <option v-for="page in totalPages" :key="`jump-${page}`" :value="page">{{ page }}</option>
              </select>
            </label>
          </div>
          <div class="page-nav">
            <button class="page-nav-btn" @click="goToPage(1)" :disabled="currentPage === 1">«</button>
            <button class="page-nav-btn" @click="prevPage" :disabled="currentPage === 1">&lt;</button>
            <button
              v-for="page in pageNumbers"
              :key="`page-${page}`"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button class="page-nav-btn" @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>
            <button class="page-nav-btn" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">»</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">Approval Detail</h3>
          <button class="close-btn" @click="closeModal">Close</button>
        </div>

        <div class="modal-body" v-if="detailLoading">
          <div class="state-card">Loading details...</div>
        </div>

        <div class="modal-body" v-else-if="detailError">
          <div class="state-card error">{{ detailError }}</div>
        </div>

        <div v-else-if="detail" class="modal-body">
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
                <input :value="detail.DocNo || '-'" readonly />
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

          <div class="remark-section">
            <label for="approval-remark">Remark</label>
            <textarea
              id="approval-remark"
              v-model="remark"
              placeholder="Enter a remark when rejecting or returning"
            ></textarea>
          </div>

          <div class="attach-section" v-if="attachmentRows.length">
            <div class="attach-label">Attach File</div>
            <div class="attach-card" v-for="file in attachmentRows" :key="file.name">
              <div class="file-display">
                <a :href="`${API_BASE}/uploads/${file.name}`" target="_blank" class="file-name">{{
                  file.name
                }}</a>
              </div>
            </div>
          </div>

          <div class="flow-section" v-if="flowSteps.length">
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

          <div class="history-section" v-if="detail.Actions?.length">
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
        </div>

        <div class="modal-footer" v-if="detail">
          <button class="btn green" @click="submitAction('APPROVE')" :disabled="actionLoading">
            Approve
          </button>
          <button class="btn orange" @click="submitAction('REJECT')" :disabled="actionLoading">
            Reject
          </button>
          <button class="btn blue" @click="submitAction('RETURN')" :disabled="actionLoading">
            Return
          </button>
          <button class="btn red" @click="closeModal" :disabled="actionLoading">Close</button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { fetchJson } from '@/services/api'

const router = useRouter()
const API_BASE = import.meta.env.VITE_API_APP_URL

const rows = ref([])
const availableStatuses = ref([])
const docTypes = ref([])
const loading = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const sortKey = ref('')
const sortOrder = ref('asc')
const searchText = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')

const showModal = ref(false)
const selectedRow = ref(null)
const detail = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const actionLoading = ref(false)
const remark = ref('')

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortKey.value = key
  sortOrder.value = 'asc'
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

const handleAuthError = (err) => {
  if (err?.status !== 401) return false
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
  localStorage.removeItem('access_token')
  router.replace('/')
  return true
}

const rowStatuses = (row) =>
  [row.ApproveStatus, row.DocStatus].map((value) => String(value || '').trim()).filter(Boolean)

const statusOptions = computed(() =>
  availableStatuses.value.length
    ? availableStatuses.value
    : [...new Set(rows.value.flatMap((row) => rowStatuses(row)))]
)

const filteredRows = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const matchesKeyword =
      !keyword ||
      [
        row.DocNo,
        row.DocType,
        row.ProjectTitle,
        row.RequesterName,
        row.RequesterUsername,
        row.RequesterDepartment,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    const matchesStatus = !statusFilter.value || rowStatuses(row).includes(statusFilter.value)

    return matchesKeyword && matchesStatus
  })
})

const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value

  return [...filteredRows.value].sort((a, b) => {
    const valueA = sortKey.value === 'RequesterName' ? a.RequesterName || a.RequesterUsername || '' : a[sortKey.value] ?? ''
    const valueB = sortKey.value === 'RequesterName' ? b.RequesterName || b.RequesterUsername || '' : b[sortKey.value] ?? ''
    const numberA = Number(valueA)
    const numberB = Number(valueB)
    const bothNumbers = !Number.isNaN(numberA) && !Number.isNaN(numberB) && valueA !== '' && valueB !== ''

    if (bothNumbers) {
      return sortOrder.value === 'asc' ? numberA - numberB : numberB - numberA
    }

    return sortOrder.value === 'asc'
      ? String(valueA).localeCompare(String(valueB), 'th')
      : String(valueB).localeCompare(String(valueA), 'th')
  })
})

const totalPages = computed(() => Math.ceil(filteredRows.value.length / pageSize.value) || 1)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + Number(pageSize.value))
})
const rangeStart = computed(() => (sortedRows.value.length ? (currentPage.value - 1) * Number(pageSize.value) + 1 : 0))
const rangeEnd = computed(() => Math.min(currentPage.value * Number(pageSize.value), sortedRows.value.length))
const pageNumbers = computed(() => {
  const total = totalPages.value
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(total, start + 4)
  const adjustedStart = Math.max(1, end - 4)
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
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

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const goToPage = (page) => {
  currentPage.value = Math.min(Math.max(Number(page) || 1, 1), totalPages.value)
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

const loadStatusOptions = async () => {
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals/waiting/statuses`)
    availableStatuses.value = Array.isArray(data) ? data.filter(Boolean) : []
  } catch (err) {
    console.error('Load waiting approval statuses failed:', err)
    availableStatuses.value = []
    handleAuthError(err)
  }
}

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals/waiting`)
    rows.value = Array.isArray(data) ? data : []
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (err) {
    console.error('Load waiting approvals failed:', err)
    rows.value = []
    if (!handleAuthError(err)) {
      errorMessage.value = err.message || 'Failed to load pending approvals.'
    }
  } finally {
    loading.value = false
  }
}

const loadDetail = async (id) => {
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    detail.value = await fetchJson(`${API_BASE}/api/approvals/${id}`)
  } catch (err) {
    console.error('Load waiting approval detail failed:', err)
    if (!handleAuthError(err)) {
      detailError.value = err.message || 'Failed to load document details.'
    }
  } finally {
    detailLoading.value = false
  }
}

const openApproval = async (row) => {
  selectedRow.value = row
  showModal.value = true
  remark.value = ''
  await loadDetail(row.Id)
}

const closeModal = () => {
  showModal.value = false
  selectedRow.value = null
  detail.value = null
  detailError.value = ''
  remark.value = ''
}

const submitAction = async (action) => {
  if (!detail.value || actionLoading.value) return
  if ((action === 'REJECT' || action === 'RETURN') && !remark.value.trim()) {
    alert('Please enter a remark before proceeding.')
    return
  }

  actionLoading.value = true
  try {
    const result = await fetchJson(`${API_BASE}/api/approvals/${detail.value.Id}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        remark: remark.value,
      }),
    })

    // alert(`ดำเนินการสำเร็จ: ${result.result || action}`)
    alert(`Approve Successfully`)
    closeModal()
    await loadData()
  } catch (err) {
    console.error('Approval action failed:', err)
    if (!handleAuthError(err)) {
      alert(err.message || 'Action failed.')
    }
  } finally {
    actionLoading.value = false
  }
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

const applySearch = () => {
  searchKeyword.value = searchText.value.trim()
}

watch([statusFilter, pageSize], () => {
  currentPage.value = 1
})

watch(searchKeyword, () => {
  currentPage.value = 1
})

onMounted(async () => {
  await loadDocTypes()
  await loadStatusOptions()
  await loadData()
})
</script>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  color: #244131;
}

.page-subtitle {
  margin: 6px 0 0;
  color: #5d6f64;
}

.refresh-btn,
.open-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  background: #178f43;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.refresh-btn:disabled,
.open-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-wrapper {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #d6e4dc;
  overflow: hidden;
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
}

.modern-table thead {
  background: #2e7d32;
  color: white;
}

.modern-table th {
  padding: 12px;
  font-size: 13px;
  user-select: none;
  cursor: pointer;
}

.modern-table td {
  padding: 10px 12px;
  font-size: 13px;
  border-top: 1px solid #e6ece9;
}

.modern-table tbody tr:nth-child(even) {
  background: #f6faf8;
}

.modern-table tbody tr:hover {
  background: #e8f5ee;
  transition: 0.2s;
  cursor: pointer;
}

.no-data {
  text-align: center;
  color: #607067;
}

.sort-icon {
  margin-left: 6px;
  font-size: 12px;
}

.action-col {
  text-align: center;
}

.text-right-amount {
  text-align: right;
  padding-right: 12px;
  font-variant-numeric: tabular-nums;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.page-summary {
  color: #43594d;
  font-size: 14px;
}

.page-controls,
.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #43594d;
  font-size: 14px;
}

.page-controls select,
.page-nav-btn,
.page-number {
  height: 36px;
  min-width: 34px;
  border-radius: 6px;
  border: 1px solid #cfd8d4;
  background: #fff;
  padding: 0 10px;
}

.page-nav-btn,
.page-number {
  cursor: pointer;
}

.page-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-number.active {
  color: #1e63c4;
  border-color: #d3ddf8;
  background: #f5f8ff;
}

.state-card {
  background: #fff;
  border: 1px solid #dce7df;
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(23, 143, 67, 0.08);
  padding: 32px;
  text-align: center;
  color: #4f6058;
}

.state-card.error {
  color: #b42318;
}

.search-section {
  background: #fff;
  border: 1px solid #dce7df;
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(23, 143, 67, 0.08);
  padding: 16px 20px;
  margin-bottom: 18px;
  width: min(100%, 1240px);
  margin-left: auto;
}

.search-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 380px) 46px;
  gap: 12px 16px;
  align-items: center;
}

.search-field {
  display: grid;
  min-width: 0;
}

.search-field label {
  font-size: 13px;
  font-weight: 600;
  color: #244131;
  white-space: nowrap;
}

.inline-field {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
}

.field-control {
  min-width: 0;
}

.search-field input,
.search-field select {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #cfd8d4;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
}

.keyword-field {
  width: 100%;
}

.keyword-field input {
  width: 100%;
}

.status-field {
  width: 100%;
  justify-self: end;
}

.status-field select {
  width: 100%;
}

.search-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.search-btn {
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #178f43;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(23, 143, 67, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.search-btn:hover {
  background: #127338;
  box-shadow: 0 10px 22px rgba(23, 143, 67, 0.24);
}

.search-btn:active {
  transform: translateY(1px);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-xl {
  width: min(96vw, 1360px);
  max-width: 96vw;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: #e6ece9;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.modal-body {
  padding: 22px 32px;
  background: #f4f6f5;
  overflow-y: auto;
}

.doc-type {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.doc-type-label {
  font-weight: 600;
  font-size: 14px;
  min-width: 130px;
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
  border-radius: 20px;
  border: 1px solid #cfd8d4;
  background: #ffffff;
  font-size: 13px;
}

.radio-pill.active {
  border-color: #9bc8ab;
  box-shadow: inset 0 0 0 1px #d6e9dc;
}

.radio-pill input[type='radio'] {
  accent-color: #2e7d32;
  margin-right: 6px;
}

.form-section {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 8px;
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
  text-align: right;
  font-weight: 600;
  font-size: 13px;
  margin-right: 12px;
}

.form-row input {
  flex: 1;
  height: 32px;
  padding: 6px 10px;
  border: 1px solid #cfd8d4;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
}

.spacing-top {
  margin-top: 10px;
}

.textarea-block {
  margin: 18px 0;
}

.textarea-block label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin: 0 0 8px;
}

.textarea-block textarea,
.remark-section textarea {
  width: 100%;
  min-height: 84px;
  padding: 8px 10px;
  border: 1px solid #cfd8d4;
  border-radius: 6px;
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

.item-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d6e4dc;
}

.item-table thead th {
  background: #cfe4d8;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  padding: 10px;
  border: 1px solid #d6e4dc;
}

.item-table td {
  border: 1px solid #e1ece6;
  padding: 8px;
  font-size: 13px;
}

.item-table tfoot td {
  border: 1px solid #d6e4dc;
  padding: 10px;
  font-weight: 600;
  background: #f4f8f6;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.fw-bold {
  font-weight: 700;
}

.flow-section {
  position: relative;
  background: #ffffff;
  border: 1px solid #d6e4dc;
  border-radius: 12px;
  padding: 26px 24px 20px;
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
  text-align: center;
  gap: 8px;
  min-height: 100px;
  justify-content: flex-start;
  width: 190px;
  flex: 0 0 190px;
}

.flow-node {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  position: relative;
  z-index: 1;
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
  font-weight: 600;
  color: #234131;
  line-height: 1.35;
  word-break: keep-all;
}

.flow-subtext {
  font-size: 12px;
  color: #5f7067;
}

.attach-label,
.block-head,
.remark-section label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  display: block;
}

.attach-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #dbe7e0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 10px;
}

.file-display {
  flex: 1;
  font-size: 13px;
}

.file-name {
  color: #2e7d32;
  font-weight: 500;
}

.modal-footer {
  background: #e6ece9;
  padding: 18px;
  text-align: center;
}

.btn {
  padding: 8px 22px;
  border-radius: 22px;
  border: none;
  margin: 0 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.btn:disabled {
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
  .modal-xl {
    width: 95vw;
  }

  .form-grid,
  .search-grid {
    grid-template-columns: 1fr;
  }
  .search-section {
    width: 100%;
  }
  .inline-field {
    grid-template-columns: 80px minmax(0, 1fr);
  }

  .form-row label {
    width: 130px;
  }
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
  .modal-body {
    padding: 18px 16px;
  }
  .pagination,
  .page-controls,
  .page-nav {
    justify-content: flex-start;
  }

  .flow-track {
    display: none;
  }
}

@media (max-width: 640px) {
  .search-section {
    padding: 14px 16px;
  }
  .inline-field,
  .form-row {
    grid-template-columns: 1fr;
  }
  .form-row {
    align-items: stretch;
  }
  .form-row label {
    width: auto;
    text-align: left;
    margin-right: 0;
    margin-bottom: 6px;
  }
  .modal-header,
  .modal-footer {
    padding-inline: 16px;
  }
  .btn {
    width: 100%;
    margin: 6px 0;
  }
}
</style>
