<template>
  <MainLayout>
    <section class="page-shell">
      <div class="page-head">
        <div>
          <h2 class="page-title">Approval History</h2>
          <p class="page-subtitle">Summary of documents you have acted on and your documents with the latest activity.</p>
        </div>
        <button class="refresh-btn" @click="loadData" :disabled="loading">Refresh</button>
      </div>

      <div v-if="loading" class="state-card">Loading data...</div>
      <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>
      <div v-else>
        <div class="summary-grid">
          <article class="summary-card approved">
            <div class="summary-label">Approved</div>
            <div class="summary-value">{{ summary.approved }}</div>
          </article>
          <article class="summary-card returned">
            <div class="summary-label">Returned</div>
            <div class="summary-value">{{ summary.returned }}</div>
          </article>
          <article class="summary-card rejected">
            <div class="summary-label">Rejected</div>
            <div class="summary-value">{{ summary.rejected }}</div>
          </article>
          <article class="summary-card inprocess">
            <div class="summary-label">In Progress</div>
            <div class="summary-value">{{ summary.inprocess }}</div>
          </article>
        </div>

        <div class="search-section">
          <div class="search-grid">
            <div class="search-field keyword-field inline-field">
              <label for="history-search">Search</label>
              <div class="field-control">
                <input
                  id="history-search"
                  v-model.trim="searchText"
                  type="text"
                  placeholder="Search document no., title, or requester"
                  @keyup.enter="applySearch"
                />
              </div>
            </div>
            <div class="search-field status-field inline-field">
              <label for="history-status-filter">Status</label>
              <div class="field-control">
                <select id="history-status-filter" v-model="statusFilter">
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
                  Doc No.
                  <span class="sort-icon" v-if="sortKey === 'DocNo'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('DocType')">
                  Document Type
                  <span class="sort-icon" v-if="sortKey === 'DocType'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('ProjectTitle')">
                  Title
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
                <th @click="sortBy('LatestAction')">
                  Latest Result
                  <span class="sort-icon" v-if="sortKey === 'LatestAction'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('LatestActionAt')">
                  Action Date
                  <span class="sort-icon" v-if="sortKey === 'LatestActionAt'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('LatestActorName')">
                  Actor
                  <span class="sort-icon" v-if="sortKey === 'LatestActorName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedRows.length === 0">
                <td colspan="10" class="no-data">No approval history</td>
              </tr>
              <tr v-for="row in paginatedRows" :key="row.Id" @click="openDetail(row)">
                <td>{{ row.DocNo || '-' }}</td>
                <td>{{ row.DocType || '-' }}</td>
                <td>{{ row.ProjectTitle || '-' }}</td>
                <td>{{ row.RequesterName || row.RequesterUsername || '-' }}</td>
                <td>{{ row.RequesterDepartment || '-' }}</td>
                <td class="text-right-amount">{{ formatNumber(row.Amount) }}</td>
                <td>
                  <span class="status-badge" :class="badgeClass(row)">
                    {{ displayHistoryStatus(row) }}
                  </span>
                </td>
                <td>{{ formatDateTime(row.LatestActionAt || row.CreateDate) }}</td>
                <td>{{ row.LatestActorName || row.LatestActorUsername || '-' }}</td>
                <td class="action-col">
                  <button class="icon-btn open-btn" @click.stop="openDetail(row)">Open</button>
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
                <input :value="formatDateTime(detail.RequestDate || detail.CreateDate)" readonly />
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
            <div class="block-head">Items</div>
            <div class="table-shell">
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
          </div>

          <div class="attach-section" v-if="attachmentRows.length">
            <div class="attach-label">Attach File</div>
            <div class="attach-card" v-for="file in attachmentRows" :key="file.name">
              <div class="file-display">
                <a :href="`${API_BASE}/uploads/${file.name}`" target="_blank" class="file-name">{{ file.name }}</a>
              </div>
            </div>
          </div>

          <div class="flow-section" v-if="flowSteps.length">
            <div class="flow-inner">
              <div class="flow-track" :style="flowTrackStyle(flowSteps)"></div>
              <div class="flow-grid">
              <div v-for="step in flowSteps" :key="step.id || `${step.step_no}-${step.approver_id}`" class="flow-node-wrap">
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
            <div class="table-shell">
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
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const API_BASE = import.meta.env.VITE_API_APP_URL

const rows = ref([])
const availableStatuses = ref([])
const loading = ref(false)
const errorMessage = ref('')
const showModal = ref(false)
const detail = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const searchText = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const sortKey = ref('')
const sortOrder = ref('asc')

const applySearch = () => {
  searchKeyword.value = searchText.value.trim()
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortKey.value = key
  sortOrder.value = 'asc'
}

const displayApproveStatus = (value) => String(value || '').trim() || '-'

const displayHistoryStatus = (row) => row.LatestAction || displayApproveStatus(row.ApproveStatus) || row.DocStatus || '-'

const historyBucket = (row) => {
  const status = String(displayHistoryStatus(row) || '').trim().toUpperCase()
  if (status === 'APPROVE' || status === 'APPROVED') return 'approved'
  if (status === 'RETURN' || status === 'RETURNED') return 'returned'
  if (status === 'REJECT' || status === 'REJECTED') return 'rejected'
  return 'inprocess'
}

const rowStatuses = (row) =>
  [displayHistoryStatus(row), displayApproveStatus(row.ApproveStatus), row.DocStatus]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

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
      [row.DocNo, row.ProjectTitle, row.DocType, row.RequesterName, row.RequesterUsername]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    const matchesStatus = !statusFilter.value || rowStatuses(row).includes(statusFilter.value)
    return matchesKeyword && matchesStatus
  })
})

const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value

  return [...filteredRows.value].sort((a, b) => {
    const valueA =
      sortKey.value === 'RequesterName'
        ? a.RequesterName || a.RequesterUsername || ''
        : sortKey.value === 'LatestActorName'
          ? a.LatestActorName || a.LatestActorUsername || ''
          : sortKey.value === 'LatestAction'
            ? displayHistoryStatus(a)
            : a[sortKey.value] ?? ''

    const valueB =
      sortKey.value === 'RequesterName'
        ? b.RequesterName || b.RequesterUsername || ''
        : sortKey.value === 'LatestActorName'
          ? b.LatestActorName || b.LatestActorUsername || ''
          : sortKey.value === 'LatestAction'
            ? displayHistoryStatus(b)
            : b[sortKey.value] ?? ''

    const dateA = sortKey.value === 'LatestActionAt' ? new Date(valueA).getTime() : Number.NaN
    const dateB = sortKey.value === 'LatestActionAt' ? new Date(valueB).getTime() : Number.NaN
    if (!Number.isNaN(dateA) && !Number.isNaN(dateB) && sortKey.value === 'LatestActionAt') {
      return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
    }

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

const totalPages = computed(() => Math.ceil(filteredRows.value.length / Number(pageSize.value)) || 1)
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
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

const summary = computed(() => ({
  approved: rows.value.filter((row) => historyBucket(row) === 'approved').length,
  returned: rows.value.filter((row) => historyBucket(row) === 'returned').length,
  rejected: rows.value.filter((row) => historyBucket(row) === 'rejected').length,
  inprocess: rows.value.filter((row) => historyBucket(row) === 'inprocess').length,
}))

const attachmentRows = computed(() => {
  if (!detail.value) return []
  return [detail.value.File1, detail.value.File2, detail.value.File3, detail.value.File4]
    .filter(Boolean)
    .map((name) => ({ name }))
})

const flowSteps = computed(() => {
  if (!detail.value) return []
  const requesterName = detail.value.RequesterName || detail.value.RequesterUsername || '-'
  return [
    {
      id: 'requester-start',
      step_no: 0,
      step_name: 'Document Created',
      ApproverName: requesterName,
      ApproverUsername: detail.value.RequesterUsername || requesterName,
      status: 'CREATED',
    },
    ...(detail.value.Steps || []).filter((step) => step.status !== 'SKIPPED'),
  ]
})

watch([statusFilter, pageSize], () => {
  currentPage.value = 1
})

watch(searchKeyword, () => {
  currentPage.value = 1
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

const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

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

const badgeClass = (row) => {
  return historyBucket(row)
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
    return { background: '#c8d8ea' }
  }

  const completedCount = visibleSteps.filter((step) => ['CREATED', 'APPROVED'].includes(step.status)).length
  const progress = Math.max(0, Math.min(100, (completedCount / (visibleSteps.length - 1)) * 100))
  return {
    background: `linear-gradient(90deg, #178f43 0%, #178f43 ${progress}%, #c8d8ea ${progress}%, #c8d8ea 100%)`,
  }
}

const flowApprover = (step) => step.ApproverName || step.ApproverUsername || step.status || '-'

const handleAuthError = (err) => {
  if (err?.status !== 401) return false
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
  localStorage.removeItem('access_token')
  alert('Your session has expired or you do not have permission.')
  router.replace('/')
  return true
}

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals/history`)
    rows.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Load approval history failed:', err)
    rows.value = []
    errorMessage.value = err.message || 'Failed to load approval history.'
    handleAuthError(err)
  } finally {
    loading.value = false
  }
}

const loadStatusOptions = async () => {
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals/history/statuses`)
    availableStatuses.value = Array.isArray(data) ? data.filter(Boolean) : []
  } catch (err) {
    console.error('Load approval history statuses failed:', err)
    availableStatuses.value = []
    handleAuthError(err)
  }
}

const openDetail = async (row) => {
  detailLoading.value = true
  detailError.value = ''
  showModal.value = true
  try {
    detail.value = await fetchJson(`${API_BASE}/api/approvals/${row.Id}`)
  } catch (err) {
    console.error('Load history detail failed:', err)
    detail.value = null
    detailError.value = err.message || 'Failed to load document details.'
    if (handleAuthError(err)) closeModal()
  } finally {
    detailLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  detail.value = null
  detailError.value = ''
}

onMounted(async () => {
  if (!authStore.user) {
    router.replace('/')
    return
  }
  await loadStatusOptions()
  await loadData()
})
</script>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  gap: 28px;
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
  color: #607067;
}

.refresh-btn {
  border: none;
  border-radius: 12px;
  background: #178f43;
  color: #fff;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
}

.state-card,
.search-section,
.summary-card,
.table-wrapper {
  background: #fff;
  border: 1px solid #dce7df;
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(23, 143, 67, 0.08);
}

.state-card {
  padding: 16px 18px;
}

.state-card.error {
  color: #b42318;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 10px;
}

.summary-card {
  padding: 18px 20px;
}

.summary-label {
  color: #607067;
  font-size: 13px;
  font-weight: 700;
}

.summary-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 800;
  color: #214332;
}

.summary-card.approved {
  background: linear-gradient(135deg, #f5fff8, #ffffff);
}

.summary-card.returned {
  background: linear-gradient(135deg, #fff8ef, #ffffff);
}

.summary-card.rejected {
  background: linear-gradient(135deg, #fff5f5, #ffffff);
}

.summary-card.inprocess {
  background: linear-gradient(135deg, #f5fbff, #ffffff);
}

.search-section {
  padding: 16px 20px;
  width: min(100%, 1180px);
  align-self: flex-end;
  margin-left: auto;
  margin-top: 4px;
  margin-bottom: 12px;
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
.search-field select,
.form-row input,
.textarea-block textarea {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #cfd8d4;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
}

.textarea-block textarea {
  height: 96px;
  padding: 12px 14px;
  resize: vertical;
}

.status-field {
  width: 100%;
  justify-self: end;
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
}

.table-wrapper {
  overflow: hidden;
  overflow-x: auto;
}

.table-wrapper {
  margin-top: 2px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table {
  min-width: 1120px;
}

.modern-table th,
.modern-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf2ee;
  text-align: left;
}

.modern-table th {
  background: #2f8337;
  color: #fff;
  cursor: pointer;
}

.modern-table tbody tr:nth-child(even) {
  background: #f5fbf7;
}

.modern-table tbody tr:hover {
  background: #eef8f1;
  cursor: pointer;
}

.action-col {
  text-align: center;
}

.text-right-amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.no-data {
  text-align: center !important;
  color: #607067;
}

.sort-icon {
  margin-left: 6px;
  font-size: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.approved {
  background: #e9f8ee;
  color: #177d3c;
}

.status-badge.returned {
  background: #fff3e3;
  color: #b96b15;
}

.status-badge.rejected {
  background: #fdecec;
  color: #c53a36;
}

.status-badge.inprocess {
  background: #e9f1fb;
  color: #2c69b3;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding-right: 6px;
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
.page-number,
.icon-btn,
.close-btn {
  height: 36px;
  border-radius: 6px;
  border: 1px solid #cfd8d4;
  background: #fff;
  padding: 0 10px;
}

.page-nav-btn,
.page-number {
  min-width: 34px;
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

.icon-btn.open-btn {
  color: #215ea8;
  cursor: pointer;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.modal-xl {
  width: min(1280px, 96vw);
  max-height: 92vh;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: #e6ece9;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #244131;
}

.modal-body {
  padding: 22px 32px;
  background: #f4f6f5;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.readonly-form {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 8px;
  border: 1px solid #d6e4dc;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.form-row label,
.textarea-block label,
.attach-label,
.block-head {
  font-weight: 700;
  color: #244131;
}

.form-row label {
  width: 140px;
  flex-shrink: 0;
}

.spacing-top {
  margin-top: 10px;
}

.textarea-block {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.attach-section,
.history-section {
  background: #ffffff;
  border: 1px solid #d6e4dc;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: none;
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

.file-name {
  color: #215ea8;
  text-decoration: none;
}

.flow-section {
  position: relative;
  background: #ffffff;
  border: 1px solid #d6e4dc;
  border-radius: 12px;
  padding: 26px 24px 20px;
  min-height: 148px;
  overflow-x: auto;
  overflow-y: visible;
  box-shadow: none;
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
  align-items: start;
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
  background: #94a3b8;
}

.flow-node.created {
  background: #178f43;
}

.flow-node.approved,
.flow-node.pending {
  background: #2d7dd2;
}

.flow-node.rejected {
  background: #df625f;
}

.flow-node.returned {
  background: #ec9d4f;
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

.item-section {
  margin-top: 22px;
}

.table-shell {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #d6e4dc;
}

.item-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  background: #ffffff;
}

.item-table thead th {
  background: #cfe4d8;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  padding: 10px;
  border: 1px solid #d6e4dc;
  color: #244131;
}

.item-table td {
  border: 1px solid #e1ece6;
  padding: 8px;
  font-size: 13px;
  text-align: left;
}

.item-table tfoot td {
  border: 1px solid #d6e4dc;
  padding: 10px;
  font-weight: 600;
  background: #f4f8f6;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-section {
    width: 100%;
    align-self: stretch;
  }

  .search-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .inline-field {
    grid-template-columns: 80px minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row label {
    width: auto;
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
  .search-section,
  .summary-card,
  .attach-section,
  .history-section,
  .readonly-form {
    padding: 16px;
  }

  .inline-field,
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row {
    align-items: stretch;
  }

  .modal-header,
  .modal-body {
    padding: 16px;
  }
}
</style>
