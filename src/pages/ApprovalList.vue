<template>
  <MainLayout>
    <section class="page-shell">
      <div class="page-head">
        <div>
          <h2 class="page-title">Approval Requests</h2>
          <p class="page-subtitle">Showing request documents.</p>
        </div>
        <button
          class="refresh-btn"
          @click="openModal"
          :disabled="!canCreate"
          :title="canCreate ? 'Create new request' : 'Only Requester role can create documents'"
        >
          Create Document
        </button>
      </div>

      <div class="search-section">
        <div class="search-grid">
          <div class="search-field keyword-field inline-field">
            <label for="approval-search">Search</label>
            <div class="field-control">
              <input
                id="approval-search"
                v-model.trim="searchText"
                type="text"
                placeholder="Search document no., title, or document type"
                @keyup.enter="applySearch"
              />
            </div>
          </div>
          <div class="search-field status-field inline-field">
            <label for="approval-status-filter">Status</label>
            <div class="field-control">
              <select id="approval-status-filter" v-model="statusFilter">
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
              <th @click="sortBy('ProjectTitle')">
                Title
                <span class="sort-icon" v-if="sortKey === 'ProjectTitle'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortBy('DocType')">
                Document Type
                <span class="sort-icon" v-if="sortKey === 'DocType'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortBy('TotalAmount')">
                Amount
                <span class="sort-icon" v-if="sortKey === 'TotalAmount'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortBy('ApproveStatus')">
                Approve Status
                <span class="sort-icon" v-if="sortKey === 'ApproveStatus'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortBy('DocStatus')">
                Doc Status
                <span class="sort-icon" v-if="sortKey === 'DocStatus'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th class="action-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedRows.length === 0">
              <td colspan="7" class="no-data">No data available</td>
            </tr>
            <tr v-for="row in paginatedRows" :key="row.Id" @click="openDetail(row)">
              <td>{{ row.DocNo || '-' }}</td>
              <td>{{ row.ProjectTitle || '-' }}</td>
              <td>{{ row.DocType || '-' }}</td>
              <td class="text-right-amount">{{ formatNumber(row.TotalAmount) }}</td>
              <td>{{ displayApproveStatus(row.ApproveStatus) }}</td>
              <td>{{ row.DocStatus || '-' }}</td>
              <td class="action-col">
                <button class="icon-btn edit-btn" @click.stop="editDoc(row)" :disabled="row.DocStatus !== 'Draft'">Edit</button>
                <button class="icon-btn delete-btn" @click.stop="deleteDoc(row)" :disabled="row.DocStatus !== 'Draft'">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <div class="page-summary">Showing {{ rangeStart }}-{{ rangeEnd }} of {{ sortedRows.length }}</div>
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
          <button class="page-nav-btn" @click="prevPage" :disabled="currentPage === 1"><</button>
          <button
            v-for="page in pageNumbers"
            :key="`page-${page}`"
            class="page-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button class="page-nav-btn" @click="nextPage" :disabled="currentPage === totalPages">></button>
          <button class="page-nav-btn" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">»</button>
        </div>
      </div>
    </section>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">{{ isDetailMode ? 'Approval Detail' : selectedId ? 'Edit Form' : 'Add Form' }}</h3>
          <button class="close-btn" @click="closeModal">Close</button>
        </div>

        <div class="modal-body">
          <fieldset :disabled="isDetailMode">
            <div class="doc-type">
              <div class="doc-type-label">Document Type:</div>
              <div class="doc-type-options">
                <label
                  v-for="docType in docTypes"
                  :key="`doctype-${docType.Id}`"
                  class="radio-pill"
                  :class="{ active: activeDocTypeId === docType.Id, disabled: isReturnedEdit }"
                >
                  <input
                    type="radio"
                    name="docType"
                    :value="docType.Id"
                    v-model="form.docType"
                    :disabled="isReturnedEdit"
                  />
                  <span>{{ docType.DocType }}</span>
                </label>
              </div>
            </div>

            <div class="form-section">
              <div class="form-grid">
                <div class="form-row"><label>Country</label><input v-model="form.country" readonly /></div>
                <div class="form-row"><label>Company</label><input v-model="form.company" readonly /></div>
                <div class="form-row"><label>Business Unit</label><input v-model="form.businessUnit" readonly /></div>
                <div class="form-row"><label>Date request</label><input v-model="form.dateRequest" readonly /></div>
                <div class="form-row"><label>Department</label><input v-model="form.department" readonly /></div>
                <div class="form-row"><label>Document No.</label><input v-model="form.docNo" readonly /></div>
              </div>

              <div class="textarea-block">
                <label>Project Title Description</label>
                <textarea v-model="form.projectTitle"></textarea>
              </div>

              <div class="form-row spacing-top"><label>Pay-in to bank account</label><input v-model="form.bank" /></div>
              <div class="form-row spacing-top"><label>Notification e-mail</label><input v-model="form.email" /></div>
              <div class="form-row spacing-top"><label>Remark</label><input v-model="form.remark" /></div>
            </div>

            <div class="item-section">
              <table class="item-table">
                <thead>
                  <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 50%">Project Description</th>
                    <th style="width: 10%">Qty</th>
                    <th style="width: 15%">Price</th>
                    <th style="width: 15%">Amount</th>
                    <th style="width: 5%" class="text-center"><button class="btn-add" @click.prevent="addItem" type="button">+</button></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="index">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td><input v-model="item.desc" /></td>
                    <td><input type="number" step="0.01" v-model.number="item.qty" class="text-right-input small-input" /></td>
                    <td><input type="number" step="0.01" min="0" v-model.number="item.price" @blur="formatPrice(item)" class="text-right-input small-input" /></td>
                    <td class="text-right-amount">{{ formatNumber(item.qty * item.price) }}</td>
                    <td class="text-center"><button class="btn-remove" @click.prevent="removeItem(index)" type="button">-</button></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-end fw-bold">Total:</td>
                    <td class="text-right-amount fw-bold">{{ formatNumber(total) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div v-if="isDetailMode && attachmentRows.length" class="attach-section">
              <div class="attach-label">Attach File</div>
              <div class="attach-card readonly" v-for="file in attachmentRows" :key="file.name">
                <div class="file-display">
                  <a :href="`${API_BASE}/uploads/${file.name}`" target="_blank" class="file-name">{{ file.name }}</a>
                </div>
              </div>
            </div>

            <div v-else class="attach-section">
              <div class="attach-label">Attach File</div>
              <div class="attach-card" v-for="(attachment, index) in attachments" :key="index">
                <input type="file" :ref="(el) => (fileInputs[index] = el)" class="hidden-input" @change="handleFileChange($event, index)" />
                <button class="btn-upload" @click="triggerFile(index)" type="button">Choose File</button>
                <div class="file-display">
                  <a v-if="attachment.name" :href="`${API_BASE}/uploads/${attachment.name}`" target="_blank" class="file-name">{{ attachment.name }}</a>
                  <span v-else class="file-placeholder">No file selected</span>
                </div>
                <button v-if="attachment.name" class="btn-clear" @click="clearFile(index)" type="button">x</button>
              </div>
            </div>

            <div v-if="isDetailMode && detailFlowSteps.length" class="flow-section">
              <div class="flow-inner">
                <div class="flow-track" :style="flowTrackStyle(detailFlowSteps)"></div>
                <div class="flow-grid">
                <div v-for="step in detailFlowSteps" :key="step.id || `${step.step_no}-${step.approver_id}`" class="flow-node-wrap">
                  <div class="flow-node" :class="flowNodeClass(step)"><span>{{ flowSymbol(step) }}</span></div>
                  <div class="flow-text">{{ flowStepLabel(step.step_name) }}</div>
                  <div class="flow-subtext">{{ flowApprover(step) }}</div>
                </div>
              </div>
              </div>
            </div>

            <div v-if="isDetailMode && detailData?.Actions?.length" class="history-section">
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
                  <tr v-for="action in detailData.Actions" :key="action.action_id">
                    <td>{{ formatDateTime(action.action_at) }}</td>
                    <td>{{ action.ActorName || action.ActorUsername || '-' }}</td>
                    <td>{{ action.action }}</td>
                    <td>{{ action.remark || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </fieldset>
        </div>

        <div class="modal-footer" v-if="!isDetailMode">
          <button class="btn green" @click="submitForm('submit')">Save & Submit</button>
          <button class="btn orange" @click="submitForm('draft')">Save Draft</button>
          <button class="btn red" @click="closeModal">Cancel</button>
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
const showModal = ref(false)
const isDetailMode = ref(false)
const selectedId = ref(null)
const detailData = ref(null)
const lockedDocType = ref(null)
const searchText = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')

const attachments = ref([
  { file: null, name: '' },
  { file: null, name: '' },
  { file: null, name: '' },
  { file: null, name: '' },
])
const fileInputs = []

const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const pageSize = ref(5)

const docTypes = ref([])
const canCreate = computed(() => authStore.hasRole('Requester'))

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortKey.value = key
  sortOrder.value = 'asc'
}

const applySearch = () => {
  searchKeyword.value = searchText.value.trim()
}

const decodeMojibakeText = (value) => {
  const text = String(value || '').trim()
  if (!text) return '-'

  try {
    const decoded = decodeURIComponent(escape(text))
    return /[ก-๙]/.test(decoded) ? decoded : text
  } catch {
    return text
  }
}

const displayApproveStatus = (value) => decodeMojibakeText(value)

const rowStatuses = (row) =>
  [displayApproveStatus(row.ApproveStatus), row.DocStatus]
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
      [row.DocNo, row.ProjectTitle, row.DocType, row.RequesterDepartment, row.RequesterName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    const matchesStatus = !statusFilter.value || rowStatuses(row).includes(statusFilter.value)
    return matchesKeyword && matchesStatus
  })
})

const sortedRows = computed(() => {
  if (!sortKey.value) return filteredRows.value

  return [...filteredRows.value].sort((a, b) => {
    const rawA = sortKey.value === 'ApproveStatus' ? displayApproveStatus(a[sortKey.value]) : a[sortKey.value]
    const rawB = sortKey.value === 'ApproveStatus' ? displayApproveStatus(b[sortKey.value]) : b[sortKey.value]
    const valA = rawA ?? ''
    const valB = rawB ?? ''
    return sortOrder.value === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1
  })
})

const totalPages = computed(() => Math.ceil(sortedRows.value.length / Number(pageSize.value)) || 1)
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

const activeDocTypeId = computed(() => Number(form.value.docType) || null)
const isReturnedEdit = computed(() => {
  if (isDetailMode.value || !selectedId.value) return false
  const approveStatus = displayApproveStatus(detailData.value?.ApproveStatus)
  return approveStatus === 'Returned'
})
const attachmentRows = computed(() => {
  if (!detailData.value) return []
  return [detailData.value.File1, detailData.value.File2, detailData.value.File3, detailData.value.File4].filter(Boolean).map((name) => ({ name }))
})
const detailFlowSteps = computed(() => {
  if (!detailData.value) return []
  const requesterName = detailData.value.RequesterName || detailData.value.RequesterUsername || authStore.user?.first_name || '-'
  return [
    {
      id: 'requester-start',
      step_no: 0,
      step_name: 'Document Created',
      ApproverName: requesterName,
      ApproverUsername: detailData.value.RequesterUsername || requesterName,
      status: 'CREATED',
    },
    ...(detailData.value.Steps || []).filter((step) => step.status !== 'SKIPPED'),
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

const triggerFile = (index) => {
  fileInputs[index]?.click()
}
const clearFile = (index) => {
  attachments.value[index] = { file: null, name: '' }
  if (fileInputs[index]) fileInputs[index].value = ''
}
const handleFileChange = (event, index) => {
  const file = event.target.files[0]
  if (!file) return
  attachments.value[index].file = file
  attachments.value[index].name = file.name
}
const resetAttachments = () => {
  attachments.value = [
    { file: null, name: '' },
    { file: null, name: '' },
    { file: null, name: '' },
    { file: null, name: '' },
  ]
}

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
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals`)
    rows.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Load data error:', err)
    rows.value = []
    handleAuthError(err)
  }
}

const loadDocTypes = async () => {
  try {
    const data = await fetchJson(`${API_BASE}/api/doc-types`)
    docTypes.value = (Array.isArray(data) ? data : []).map((docType) => ({
      Id: Number(docType.Id),
      DocType: docType.DocType,
    }))
  } catch (err) {
    console.error('Load doc types failed:', err)
    docTypes.value = []
    handleAuthError(err)
  }
}

const loadStatusOptions = async () => {
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals/statuses`)
    availableStatuses.value = Array.isArray(data) ? data.filter(Boolean) : []
  } catch (err) {
    console.error('Load approval statuses failed:', err)
    availableStatuses.value = []
    handleAuthError(err)
  }
}

const getDocTypeId = (docTypeValue) => {
  if (docTypeValue === null || docTypeValue === undefined || docTypeValue === '') return null
  const asNumber = Number(docTypeValue)
  if (!Number.isNaN(asNumber) && docTypes.value.some((docType) => docType.Id === asNumber)) {
    return asNumber
  }
  return docTypes.value.find((docType) => docType.DocType === String(docTypeValue))?.Id ?? null
}

const formatDateForUI = (input) => {
  if (!input) return ''
  const date = new Date(input)
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

const getDefaultForm = () => {
  const user = authStore.user
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  return {
    docType: null,
    country: 'Thailand',
    company: 'GFCS',
    businessUnit: user?.division_name || '',
    department: user?.department || '',
    dateRequest: `${dd}-${mm}-${yyyy}`,
    docNo: '',
    projectTitle: '',
    bank: '',
    email: user?.email || '',
    remark: '',
  }
}

const form = ref(getDefaultForm())
const items = ref([{ desc: '', qty: 1, price: 0 }])

const resetForm = () => {
  form.value = getDefaultForm()
  items.value = [{ desc: '', qty: 1, price: 0 }]
}

const mapDataToForm = (data) => ({
  docType: getDocTypeId(data.DocTypeId ?? data.DocType),
  country: data.Country,
  company: data.Company,
  businessUnit: data.BusinessUnit,
  department: data.Department || data.RequesterDepartment,
  dateRequest: formatDateForUI(data.RequestDate || data.CreateDate),
  docNo: data.DocNo,
  projectTitle: data.ProjectTitle,
  bank: data.BankInfo,
  email: data.NotifyEmail,
  remark: data.Remark,
})

const openModal = () => {
  if (!canCreate.value) {
    alert('Only Requester role can create documents')
    return
  }
  selectedId.value = null
  detailData.value = null
  isDetailMode.value = false
  resetForm()
  resetAttachments()
  lockedDocType.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  detailData.value = null
  isDetailMode.value = false
  selectedId.value = null
  lockedDocType.value = null
  resetForm()
  resetAttachments()
}

const addItem = () => {
  items.value.push({ desc: '', qty: 1, price: 0 })
}
const removeItem = (index) => {
  if (items.value.length > 1) items.value.splice(index, 1)
}

const total = computed(() =>
  items.value.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0)
)

const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const formatPrice = (item) => {
  item.price = Number((Number(item.price) || 0).toFixed(2))
}

const validateForm = () => {
  if (!form.value.docType) return alert('Please select a document type.')
  if (!form.value.projectTitle) return alert('Project Title required')
  if (!form.value.bank) return alert('Bank required')
  if (!form.value.email) return alert('Email required')

  for (const item of items.value) {
    if (!item.desc) return alert('Please enter an item description.')
    if (!item.qty || item.qty <= 0) return alert('Qty must be greater than 0.')
    if (!item.price || item.price <= 0) return alert('Price must be greater than 0.')
  }

  return true
}

const editDoc = async (row) => {
  try {
    if (row.DocStatus !== 'Draft') {
      alert('Only Draft document can be edited')
      return
    }

    const data = await fetchJson(`${API_BASE}/api/approvals/${row.Id}`)
    detailData.value = data
    form.value = mapDataToForm(data)
    items.value = (data.Items || []).map((item) => ({
      desc: item.ItemDescription,
      qty: item.Qty,
      price: item.Price,
    }))
    attachments.value = [
      { file: null, name: data.File1 || '' },
      { file: null, name: data.File2 || '' },
      { file: null, name: data.File3 || '' },
      { file: null, name: data.File4 || '' },
    ]
    if (items.value.length === 0) items.value = [{ desc: '', qty: 1, price: 0 }]
    selectedId.value = row.Id
    lockedDocType.value = displayApproveStatus(data.ApproveStatus) === 'Returned' ? form.value.docType : null
    isDetailMode.value = false
    showModal.value = true
  } catch (err) {
    console.error(err)
    if (handleAuthError(err)) return
    alert('Failed to load data.')
  }
}

const submitForm = async (action) => {
  if (!canCreate.value) {
    alert('Only Requester role can create or edit documents')
    return
  }

  if (action === 'submit' && !validateForm()) return

  const user = authStore.user
  const formData = new FormData()
  formData.append('DocType', isReturnedEdit.value ? lockedDocType.value || form.value.docType : form.value.docType)
  formData.append('Country', form.value.country)
  formData.append('Company', form.value.company)
  formData.append('BusinessUnit', form.value.businessUnit)
  formData.append('Department', form.value.department)
  formData.append('ProjectTitle', form.value.projectTitle)

  const [dd, mm, yyyy] = form.value.dateRequest.split('-')
  formData.append('RequestDate', `${yyyy}-${mm}-${dd}`)
  formData.append('BankInfo', form.value.bank)
  formData.append('NotifyEmail', form.value.email)
  formData.append('Remark', form.value.remark)

  if (selectedId.value) {
    formData.append('ModifiedBy', user.employee_id)
  } else {
    formData.append('CreatedBy', user.employee_id)
  }

  formData.append('Action', action)
  formData.append('Items', JSON.stringify(items.value.map((item) => ({
    ItemDescription: item.desc,
    Qty: Number(item.qty || 0),
    Price: Number(item.price || 0),
    Unit: '',
  }))))

  attachments.value.forEach((attachment) => {
    if (attachment.file) formData.append('files', attachment.file)
  })

  try {
    const url = selectedId.value ? `${API_BASE}/api/approvals/update/${selectedId.value}` : `${API_BASE}/api/approvals/add`
    const method = selectedId.value ? 'PUT' : 'POST'
    await fetchJson(url, { method, body: formData })
    alert(action === 'draft' ? 'Draft saved successfully.' : 'Saved and submitted successfully.')
    await loadData()
    closeModal()
  } catch (err) {
    console.error(err)
    if (handleAuthError(err)) return
    alert(err.message || 'An unexpected error occurred.')
  }
}

const deleteDoc = async (row) => {
  if (row.DocStatus !== 'Draft') {
    alert('Only Draft document can be deleted')
    return
  }
  if (!confirm('Confirm delete this document?')) return

  try {
    await fetchJson(`${API_BASE}/api/approvals/${row.Id}`, { method: 'DELETE' })
    alert('Delete completed')
    await loadData()
  } catch (err) {
    console.error(err)
    if (handleAuthError(err)) return
    alert(err.message)
  }
}

const openDetail = async (row) => {
  try {
    const data = await fetchJson(`${API_BASE}/api/approvals/${row.Id}`)
    detailData.value = data
    form.value = mapDataToForm(data)
    items.value = (data.Items || []).map((item) => ({
      desc: item.ItemDescription,
      qty: item.Qty,
      price: item.Price,
    }))
    if (items.value.length === 0) items.value = [{ desc: '', qty: 1, price: 0 }]
    selectedId.value = row.Id
    isDetailMode.value = true
    showModal.value = true
  } catch (err) {
    console.error(err)
    if (handleAuthError(err)) return
    alert('Failed to load data.')
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

onMounted(async () => {
  if (!authStore.user) {
    router.replace('/')
    return
  }

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
.refresh-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  background: #178f43;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.search-section {
  background: #fff;
  border: 1px solid #dce7df;
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(23, 143, 67, 0.08);
  padding: 16px 20px;
  width: min(100%, 1240px);
  align-self: flex-end;
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
  width: min(96vw, 1320px);
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
  cursor: pointer;
}
.radio-pill.active {
  border-color: #9bc8ab;
  box-shadow: inset 0 0 0 1px #d6e9dc;
}
.radio-pill.disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.radio-pill input[type='radio'] {
  accent-color: #2e7d32;
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
.textarea-block textarea {
  width: 100%;
  min-height: 84px;
  padding: 8px 10px;
  border: 1px solid #cfd8d4;
  border-radius: 6px;
  font-size: 13px;
}
.item-section,
.attach-section,
.history-section,
.flow-section {
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
.item-table input {
  width: 100%;
  height: 30px;
  padding: 4px 8px;
  border: 1px solid #cfd8d4;
  border-radius: 4px;
  font-size: 13px;
}
.item-table tfoot td {
  border: 1px solid #d6e4dc;
  padding: 10px;
  font-weight: 600;
  background: #f4f8f6;
}
.text-right-input {
  text-align: right;
}
.text-right-amount {
  text-align: right;
  padding-right: 12px;
  font-variant-numeric: tabular-nums;
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
.btn-add,
.btn-remove {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #cfd8d4;
  background: #ffffff;
  font-weight: 600;
  cursor: pointer;
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
.block-head {
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
.hidden-input {
  display: none;
}
.btn-upload {
  background: #2ecc71;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.file-display {
  flex: 1;
  font-size: 13px;
}
.file-placeholder {
  color: #9aa5a0;
}
.file-name {
  color: #2e7d32;
  font-weight: 500;
}
.btn-clear {
  background: #f8d7da;
  border: 1px solid #f5c2c7;
  color: #c0392b;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
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
.green {
  background: #2ecc71;
}
.orange {
  background: #f39c12;
}
.red {
  background: #e74c3c;
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
  min-width: 920px;
  border-collapse: collapse;
}
.modern-table thead {
  background: #2e7d32;
  color: white;
}
.modern-table th {
  padding: 12px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
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
.action-col {
  text-align: center;
}
.icon-btn {
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  margin: 0 4px;
  padding: 6px 10px;
}
.edit-btn {
  background: #e3f2fd;
}
.delete-btn {
  background: #fdecea;
}
.icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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
    align-self: stretch;
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
