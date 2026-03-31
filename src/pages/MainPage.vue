<template>
  <MainLayout>
    <section class="dashboard-shell">
      <div v-if="loading" class="state-card">Loading dashboard data...</div>
      <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>
      <template v-else>
        <section class="hero-card">
          <div class="hero-copy">
            <p class="hero-kicker">Approval Workspace</p>
            <h1>{{ greetingTitle }}</h1>
            <p class="hero-description">
              Overview of the documents related to you today, including pending approvals, recent activity, and document status across the system.
            </p>

            <div class="hero-meta">
              <span class="meta-pill">{{ authStore.user?.username || '-' }}</span>
              <span class="meta-pill">{{ authStore.user?.department || '-' }}</span>
              <span class="meta-pill">{{ roleText }}</span>
            </div>
          </div>

          <div class="hero-stats">
            <article v-for="card in summaryCards" :key="card.key" class="stat-card" :class="card.tone">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-note">{{ card.note }}</div>
            </article>
          </div>
        </section>

        <section class="quick-grid">
          <article class="panel-card spotlight">
            <div class="panel-head">
              <div>
                <h2>Your Pending Approvals</h2>
                <p>Items waiting for your action in the current step</p>
              </div>
              <button class="panel-link" @click="router.push('/main/waiting')" :disabled="!canApprove">Open List</button>
            </div>

            <div v-if="!canApprove" class="empty-state">This account does not have approval permission.</div>
            <ul v-else-if="waitingPreview.length" class="activity-list">
              <li v-for="item in waitingPreview" :key="`waiting-${item.Id}`" class="activity-item" @click="openPendingApproval(item)">
                <div class="activity-main">
                  <div class="activity-doc">{{ item.DocNo || '-' }}</div>
                  <div class="activity-title">{{ item.ProjectTitle || '-' }}</div>
                  <div class="activity-meta">{{ item.DocType || '-' }} · {{ item.RequesterDepartment || '-' }}</div>
                </div>
                <div class="activity-side">
                  <span class="status-badge waiting">{{ item.ApproveStatus || item.DocStatus || '-' }}</span>
                  <div class="amount">{{ formatNumber(item.Amount) }}</div>
                </div>
              </li>
            </ul>
            <div v-else class="empty-state">There are no pending approvals at the moment.</div>
          </article>

          <article class="panel-card">
            <div class="panel-head">
              <div>
                <h2>Latest Department Documents</h2>
                <p>Based on real data from the database for your department</p>
              </div>
              <button class="panel-link" @click="router.push('/approvals')" :disabled="!isRequester">Open List</button>
            </div>

            <ul v-if="requestPreview.length" class="activity-list compact">
              <li v-for="item in requestPreview" :key="`request-${item.Id}`" class="activity-item" @click="openTarget(item, '/approvals')">
                <div class="activity-main">
                  <div class="activity-doc">{{ item.DocNo || '-' }}</div>
                  <div class="activity-title">{{ item.ProjectTitle || '-' }}</div>
                </div>
                <div class="activity-side">
                  <span class="status-badge" :class="docBadgeClass(item.DocStatus)">{{ item.DocStatus || '-' }}</span>
                </div>
              </li>
            </ul>
            <div v-else class="empty-state">There are no documents in the current dashboard scope yet.</div>
          </article>
        </section>

        <section class="panel-card">
          <div class="panel-head">
            <div>
              <h2>Recent Activity</h2>
              <p>Summary of documents you recently approved, returned, or rejected</p>
            </div>
            <button class="panel-link" @click="router.push('/main/history')">View All</button>
          </div>

          <div v-if="actedPreview.length" class="history-grid compact-history-grid">
            <article v-for="item in actedPreview" :key="`acted-${item.Id}-${item.ActionAt}`" class="history-card" @click="openRecentActivity(item)">
              <div class="history-top">
                <div>
                  <div class="activity-doc">{{ item.DocNo || '-' }}</div>
                  <div class="activity-title">{{ item.ProjectTitle || '-' }}</div>
                </div>
                <span class="status-badge" :class="actionBadgeClass(item.Action)">{{ actionLabel(item.Action) }}</span>
              </div>
              <div class="history-meta">
                <span>{{ item.DocType || '-' }}</span>
                <span>{{ formatDateTime(item.ActionAt || item.CreateDate) }}</span>
              </div>
              <div class="history-footer">
                <span>{{ item.RequesterDepartment || '-' }}</span>
                <strong>{{ formatNumber(item.Amount) }}</strong>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">No recent activity available yet.</div>
        </section>
      </template>
    </section>

    <div v-if="showPendingModal" class="modal-backdrop" @click.self="closePendingModal">
      <div class="modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">Approval Detail</h3>
          <button class="close-btn" @click="closePendingModal">Close</button>
        </div>

        <div v-if="detailLoading" class="modal-body">
          <div class="state-card">Loading details...</div>
        </div>

        <div v-else-if="detailError" class="modal-body">
          <div class="state-card error">{{ detailError }}</div>
        </div>

        <div v-else-if="pendingDetail" class="modal-body">
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
                <input :value="pendingDetail.Country || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Company</label>
                <input :value="pendingDetail.Company || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Business Unit</label>
                <input :value="pendingDetail.BusinessUnit || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Date request</label>
                <input :value="formatDateForUI(pendingDetail.RequestDate || pendingDetail.CreateDate)" readonly />
              </div>
              <div class="form-row">
                <label>Department</label>
                <input :value="pendingDetail.Department || pendingDetail.RequesterDepartment || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Document No.</label>
                <input :value="pendingDetail.DocNo || '-'" readonly />
              </div>
            </div>

            <div class="textarea-block">
              <label>Project Title Description</label>
              <textarea :value="pendingDetail.ProjectTitle || '-'" readonly></textarea>
            </div>

            <div class="form-row spacing-top">
              <label>Pay-in to bank account</label>
              <input :value="pendingDetail.BankInfo || '-'" readonly />
            </div>
            <div class="form-row spacing-top">
              <label>Notification e-mail</label>
              <input :value="pendingDetail.NotifyEmail || '-'" readonly />
            </div>
            <div class="form-row spacing-top">
              <label>Remark</label>
              <input :value="pendingDetail.Remark || '-'" readonly />
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
                <tr v-for="(item, index) in pendingDetail.Items || []" :key="item.Id || index">
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
                  <td class="text-right-amount fw-bold">{{ formatNumber(pendingDetail.Amount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="remark-section">
            <label for="dashboard-approval-remark">Remark</label>
            <textarea
              id="dashboard-approval-remark"
              v-model="actionRemark"
              placeholder="Enter a remark when rejecting or returning"
            ></textarea>
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

          <div v-if="pendingDetail.Actions?.length" class="history-section">
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
                <tr v-for="action in pendingDetail.Actions" :key="action.action_id">
                  <td>{{ formatDateTime(action.action_at) }}</td>
                  <td>{{ action.ActorName || action.ActorUsername || '-' }}</td>
                  <td>{{ action.action }}</td>
                  <td>{{ action.remark || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="pendingDetail" class="modal-footer">
          <button class="btn green" @click="submitPendingAction('APPROVE')" :disabled="actionLoading">Approve</button>
          <button class="btn orange" @click="submitPendingAction('REJECT')" :disabled="actionLoading">Reject</button>
          <button class="btn blue" @click="submitPendingAction('RETURN')" :disabled="actionLoading">Return</button>
          <button class="btn red" @click="closePendingModal" :disabled="actionLoading">Close</button>
        </div>
      </div>
    </div>

    <div v-if="showHistoryModal" class="modal-backdrop" @click.self="closeHistoryModal">
      <div class="modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">Approval Detail</h3>
          <button class="close-btn" @click="closeHistoryModal">Close</button>
        </div>

        <div v-if="historyDetailLoading" class="modal-body">
          <div class="state-card">Loading details...</div>
        </div>

        <div v-else-if="historyDetailError" class="modal-body">
          <div class="state-card error">{{ historyDetailError }}</div>
        </div>

        <div v-else-if="historyDetail" class="modal-body">
          <div class="doc-type">
            <div class="doc-type-label">Document Type:</div>
            <div class="doc-type-options">
              <label
                v-for="docType in docTypes"
                :key="`history-doc-type-${docType.Id}`"
                class="radio-pill"
                :class="{ active: activeHistoryDocTypeId === docType.Id }"
              >
                <input type="radio" :checked="activeHistoryDocTypeId === docType.Id" disabled />
                <span>{{ docType.DocType }}</span>
              </label>
            </div>
          </div>

          <div class="form-section readonly-form">
            <div class="form-grid">
              <div class="form-row">
                <label>Country</label>
                <input :value="historyDetail.Country || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Company</label>
                <input :value="historyDetail.Company || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Business Unit</label>
                <input :value="historyDetail.BusinessUnit || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Date request</label>
                <input :value="formatDateTime(historyDetail.RequestDate || historyDetail.CreateDate)" readonly />
              </div>
              <div class="form-row">
                <label>Department</label>
                <input :value="historyDetail.Department || historyDetail.RequesterDepartment || '-'" readonly />
              </div>
              <div class="form-row">
                <label>Document No.</label>
                <input :value="historyDetail.DocNo || '-'" readonly />
              </div>
            </div>

            <div class="textarea-block">
              <label>Project Title Description</label>
              <textarea :value="historyDetail.ProjectTitle || '-'" readonly></textarea>
            </div>

            <div class="form-row spacing-top">
              <label>Pay-in to bank account</label>
              <input :value="historyDetail.BankInfo || '-'" readonly />
            </div>
            <div class="form-row spacing-top">
              <label>Notification e-mail</label>
              <input :value="historyDetail.NotifyEmail || '-'" readonly />
            </div>
            <div class="form-row spacing-top">
              <label>Remark</label>
              <input :value="historyDetail.Remark || '-'" readonly />
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
                  <tr v-for="(item, index) in historyDetail.Items || []" :key="item.Id || index">
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
                    <td class="text-right-amount fw-bold">{{ formatNumber(historyDetail.Amount) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div v-if="historyAttachmentRows.length" class="attach-section">
            <div class="attach-label">Attach File</div>
            <div v-for="file in historyAttachmentRows" :key="file.name" class="attach-card">
              <div class="file-display">
                <a :href="`${API_BASE}/uploads/${file.name}`" target="_blank" class="file-name">{{ file.name }}</a>
              </div>
            </div>
          </div>

          <div v-if="historyFlowSteps.length" class="flow-section">
            <div class="flow-inner">
              <div class="flow-track" :style="flowTrackStyle(historyFlowSteps)"></div>
              <div class="flow-grid">
                <div
                  v-for="step in historyFlowSteps"
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

          <div v-if="historyDetail.Actions?.length" class="history-section">
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
                  <tr v-for="action in historyDetail.Actions" :key="action.action_id">
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { fetchJson } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const API_BASE = import.meta.env.VITE_API_APP_URL

const loading = ref(false)
const errorMessage = ref('')
const docTypes = ref([])
const dashboard = ref({
  summary: {},
  waiting: [],
  requests: [],
  acted: [],
})
const showPendingModal = ref(false)
const pendingDetail = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const actionLoading = ref(false)
const actionRemark = ref('')
const showHistoryModal = ref(false)
const historyDetail = ref(null)
const historyDetailLoading = ref(false)
const historyDetailError = ref('')

const canApprove = computed(() => authStore.can('approval:approve'))
const isRequester = computed(() => authStore.hasRole('Requester'))
const waitingPreview = computed(() => dashboard.value.waiting.slice(0, 2))
const requestPreview = computed(() => dashboard.value.requests.slice(0, 2))
const actedPreview = computed(() => dashboard.value.acted.slice(0, 3))

const greetingTitle = computed(() => {
  const firstName = authStore.user?.first_name || authStore.user?.username || 'User'
  return `Welcome, ${firstName}`
})

const roleText = computed(() => {
  if (canApprove.value && isRequester.value) return 'Requester + Approver'
  if (canApprove.value) return 'Approver'
  if (isRequester.value) return 'Requester'
  return 'User'
})

const summaryCards = computed(() => {
  const summary = dashboard.value.summary || {}
  const departmentRows = Array.isArray(dashboard.value.requests) ? dashboard.value.requests : []
  const departmentApproved = departmentRows.filter((row) => String(row.DocStatus || '').trim() === 'Approved').length
  const departmentRejectedReturned = departmentRows.filter((row) => {
    const status = String(row.DocStatus || '').trim()
    return status === 'Rejected' || status === 'Draft'
  }).length
  const departmentInprocess = Math.max(0, departmentRows.length - departmentApproved - departmentRejectedReturned)
  const returnedRejectedTotal = (summary.ActedReturnCount || 0) + (summary.ActedRejectCount || 0)
  const nonRequesterTotal =
    (summary.WaitingCount || 0) + (summary.ActedApproveCount || 0) + returnedRejectedTotal

  if (isRequester.value) {
    return [
      {
        key: 'approved',
        label: 'Approved',
        value: departmentApproved,
        note: 'Approved documents in your department',
        tone: 'emerald',
      },
      {
        key: 'inprocess',
        label: 'Inprocess',
        value: departmentInprocess,
        note: 'Documents still in progress in your department',
        tone: 'blue',
      },
      {
        key: 'total',
        label: 'Total',
        value: departmentRows.length,
        note: 'Total documents in your department scope',
        tone: 'green',
      },
      {
        key: 'rejected-returned',
        label: 'Reject / Return',
        value: departmentRejectedReturned,
        note: 'Rejected or returned documents in your department',
        tone: 'amber',
      },
    ]
  }

  return [
    {
      key: 'waiting',
      label: 'Your Pending Items',
      value: summary.WaitingCount || 0,
      note: canApprove.value ? 'Documents waiting for your action' : 'No approval permission',
      tone: 'blue',
    },
    {
      key: 'requests',
      label: isRequester.value ? 'Department Documents' : 'Total Documents',
      value: isRequester.value ? summary.RequestTotal || 0 : nonRequesterTotal,
      note: isRequester.value ? 'Number of documents in your department scope' : 'Pending, approved, returned, and rejected items for this account',
      tone: 'green',
    },
    {
      key: 'approved',
      label: 'Approved by You',
      value: summary.ActedApproveCount || 0,
      note: "Based on this account's approval history",
      tone: 'emerald',
    },
    {
      key: 'returned',
      label: 'Returned / Rejected',
      value: returnedRejectedTotal,
      note: 'Total items you returned or rejected',
      tone: 'amber',
    },
  ]
})

const activeDocTypeId = computed(() => {
  if (!pendingDetail.value) return null
  const value = pendingDetail.value.DocTypeId ?? pendingDetail.value.DocType
  const numeric = Number(value)
  if (!Number.isNaN(numeric) && docTypes.value.some((item) => item.Id === numeric)) {
    return numeric
  }
  return docTypes.value.find((item) => item.DocType === String(value))?.Id ?? null
})

const activeHistoryDocTypeId = computed(() => {
  if (!historyDetail.value) return null
  const value = historyDetail.value.DocTypeId ?? historyDetail.value.DocType
  const numeric = Number(value)
  if (!Number.isNaN(numeric) && docTypes.value.some((item) => item.Id === numeric)) {
    return numeric
  }
  return docTypes.value.find((item) => item.DocType === String(value))?.Id ?? null
})

const attachmentRows = computed(() => {
  if (!pendingDetail.value) return []
  return [pendingDetail.value.File1, pendingDetail.value.File2, pendingDetail.value.File3, pendingDetail.value.File4]
    .filter(Boolean)
    .map((name) => ({ name }))
})

const historyAttachmentRows = computed(() => {
  if (!historyDetail.value) return []
  return [historyDetail.value.File1, historyDetail.value.File2, historyDetail.value.File3, historyDetail.value.File4]
    .filter(Boolean)
    .map((name) => ({ name }))
})

const flowSteps = computed(() => {
  if (!pendingDetail.value) return []

  const requesterName = pendingDetail.value.RequesterName || pendingDetail.value.RequesterUsername || '-'
  const createdStep = {
    id: 'requester-start',
    step_no: 0,
    step_name: 'Document Created',
    ApproverName: requesterName,
    ApproverUsername: pendingDetail.value.RequesterUsername || requesterName,
    status: 'CREATED',
  }

  const visibleSteps = (pendingDetail.value.Steps || []).filter((step) => step.status !== 'SKIPPED')
  return [createdStep, ...visibleSteps]
})

const historyFlowSteps = computed(() => {
  if (!historyDetail.value) return []

  const requesterName = historyDetail.value.RequesterName || historyDetail.value.RequesterUsername || '-'
  const createdStep = {
    id: 'requester-start',
    step_no: 0,
    step_name: 'Document Created',
    ApproverName: requesterName,
    ApproverUsername: historyDetail.value.RequesterUsername || requesterName,
    status: 'CREATED',
  }

  const visibleSteps = (historyDetail.value.Steps || []).filter((step) => step.status !== 'SKIPPED')
  return [createdStep, ...visibleSteps]
})

const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString('en-US', {
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

const actionLabel = (action) => {
  if (action === 'APPROVE') return 'Approve'
  if (action === 'RETURN') return 'Return'
  if (action === 'REJECT') return 'Reject'
  return action || '-'
}

const actionBadgeClass = (action) => {
  if (action === 'APPROVE') return 'approved'
  if (action === 'RETURN') return 'returned'
  if (action === 'REJECT') return 'rejected'
  return 'inprocess'
}

const docBadgeClass = (status) => {
  if (status === 'Approved') return 'approved'
  if (status === 'Rejected') return 'rejected'
  if (status === 'Draft') return 'returned'
  return 'inprocess'
}

const handleAuthError = (err) => {
  if (err?.status !== 401) return false
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
  localStorage.removeItem('access_token')
  router.replace('/')
  return true
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

const openTarget = (item, fallbackPath) => {
  if (fallbackPath === '/main/waiting' && canApprove.value) {
    router.push(`/approvals/approve/${item.Id}`)
    return
  }
  router.push(fallbackPath)
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

const loadPendingDetail = async (id) => {
  detailLoading.value = true
  detailError.value = ''
  pendingDetail.value = null
  try {
    pendingDetail.value = await fetchJson(`${API_BASE}/api/approvals/${id}`)
  } catch (err) {
    console.error('Load dashboard pending detail failed:', err)
    if (!handleAuthError(err)) {
      detailError.value = err.message || 'Failed to load document details.'
    }
  } finally {
    detailLoading.value = false
  }
}

const loadHistoryDetail = async (id) => {
  historyDetailLoading.value = true
  historyDetailError.value = ''
  historyDetail.value = null
  try {
    historyDetail.value = await fetchJson(`${API_BASE}/api/approvals/${id}`)
  } catch (err) {
    console.error('Load dashboard history detail failed:', err)
    if (!handleAuthError(err)) {
      historyDetailError.value = err.message || 'Failed to load document details.'
    }
  } finally {
    historyDetailLoading.value = false
  }
}

const openPendingApproval = async (item) => {
  if (!canApprove.value) return
  showPendingModal.value = true
  actionRemark.value = ''
  await loadPendingDetail(item.Id)
}

const closePendingModal = () => {
  showPendingModal.value = false
  pendingDetail.value = null
  detailError.value = ''
  actionRemark.value = ''
}

const openRecentActivity = async (item) => {
  showHistoryModal.value = true
  await loadHistoryDetail(item.Id)
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  historyDetail.value = null
  historyDetailError.value = ''
}

const submitPendingAction = async (action) => {
  if (!pendingDetail.value || actionLoading.value) return
  if ((action === 'REJECT' || action === 'RETURN') && !actionRemark.value.trim()) {
    alert('Please enter a remark before proceeding.')
    return
  }

  actionLoading.value = true
  try {
    await fetchJson(`${API_BASE}/api/approvals/${pendingDetail.value.Id}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        remark: actionRemark.value,
      }),
    })

    alert('Approve Successfully')
    closePendingModal()
    await loadData()
  } catch (err) {
    console.error('Dashboard approval action failed:', err)
    if (!handleAuthError(err)) {
      alert(err.message || 'Action failed.')
    }
  } finally {
    actionLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    dashboard.value = await fetchJson(`${API_BASE}/api/dashboard/overview`)
  } catch (err) {
    console.error('Load dashboard failed:', err)
    if (!handleAuthError(err)) {
      errorMessage.value = err.message || 'Failed to load dashboard.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  if (!user) {
    router.replace('/')
    return
  }
  await loadDocTypes()
  await loadData()
})
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}

.state-card,
.hero-card,
.panel-card,
.stat-card {
  background: #fff;
  border: 1px solid #dce7df;
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(23, 143, 67, 0.08);
}

.state-card {
  padding: 18px 20px;
}

.state-card.error {
  color: #b42318;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(420px, 1fr);
  gap: 20px;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(84, 196, 132, 0.18), transparent 32%),
    linear-gradient(135deg, #f8fff9 0%, #ffffff 58%, #f4fbf7 100%);
}

.hero-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #178f43;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 1;
  color: #1f3d2d;
}

.hero-description {
  margin: 14px 0 0;
  max-width: 720px;
  font-size: 14px;
  line-height: 1.65;
  color: #56685f;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.meta-pill {
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(23, 143, 67, 0.08);
  color: #1c5a35;
  font-size: 12px;
  font-weight: 700;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-width: 1px;
  border-style: solid;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 247, 0.92));
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: auto -24px -28px auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  opacity: 0.2;
  pointer-events: none;
}

.stat-card.blue {
  border-color: #bfd8fb;
  background: linear-gradient(145deg, #f6fbff 0%, #e9f3ff 100%);
}

.stat-card.blue::after {
  background: radial-gradient(circle, #4f8fe6 0%, rgba(79, 143, 230, 0) 70%);
}

.stat-card.green {
  border-color: #bdeacb;
  background: linear-gradient(145deg, #f4fff8 0%, #e7f8ee 100%);
}

.stat-card.green::after {
  background: radial-gradient(circle, #39c16f 0%, rgba(57, 193, 111, 0) 70%);
}

.stat-card.emerald {
  border-color: #c8ead7;
  background: linear-gradient(145deg, #ffffff 0%, #f2fbf6 100%);
}

.stat-card.emerald::after {
  background: radial-gradient(circle, #5abf87 0%, rgba(90, 191, 135, 0) 70%);
}

.stat-card.amber {
  border-color: #f2dbb1;
  background: linear-gradient(145deg, #fffdfa 0%, #fff5e7 100%);
}

.stat-card.amber::after {
  background: radial-gradient(circle, #e5a43a 0%, rgba(229, 164, 58, 0) 70%);
}

.stat-card.blue .stat-label,
.stat-card.blue .stat-note {
  color: #4f6d90;
}

.stat-card.green .stat-label,
.stat-card.green .stat-note {
  color: #48745c;
}

.stat-card.emerald .stat-label,
.stat-card.emerald .stat-note {
  color: #587367;
}

.stat-card.amber .stat-label,
.stat-card.amber .stat-note {
  color: #84684f;
}

.stat-card.blue .stat-value {
  color: #215ea8;
}

.stat-card.green .stat-value {
  color: #178f43;
}

.stat-card.emerald .stat-value {
  color: #1f6c49;
}

.stat-card.amber .stat-value {
  color: #b56d1d;
}

.stat-label {
  font-size: 13px;
  font-weight: 700;
}

.stat-value {
  margin-top: 8px;
  font-size: 31px;
  font-weight: 800;
}

.stat-note {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.45;
}

.quick-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
  gap: 20px;
}

.panel-card {
  padding: 22px;
  min-width: 0;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head h2 {
  margin: 0;
  color: #214332;
  font-size: 22px;
}

.panel-head p {
  margin: 6px 0 0;
  color: #667970;
  font-size: 14px;
}

.panel-link {
  border: none;
  border-radius: 12px;
  background: #178f43;
  color: #fff;
  height: 40px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
}

.panel-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.activity-item,
.history-card {
  border: 1px solid #e5eee8;
  border-radius: 16px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #ffffff, #f9fcfa);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}

.activity-item:hover,
.history-card:hover {
  transform: translateY(-1px);
  border-color: #cde4d4;
  box-shadow: 0 12px 28px rgba(23, 143, 67, 0.08);
  cursor: pointer;
}

.activity-main,
.activity-side {
  min-width: 0;
}

.activity-doc {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #178f43;
}

.activity-title {
  margin-top: 4px;
  font-size: 17px;
  font-weight: 800;
  color: #1f3d2d;
  line-height: 1.35;
}

.activity-meta,
.history-meta {
  margin-top: 6px;
  color: #6b7d74;
  font-size: 13px;
}

.activity-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.amount {
  font-size: 15px;
  font-weight: 800;
  color: #1f3d2d;
  font-variant-numeric: tabular-nums;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-badge.waiting,
.status-badge.inprocess {
  background: #e8f1fb;
  color: #255da1;
}

.status-badge.approved {
  background: #e9f8ee;
  color: #187d3c;
}

.status-badge.returned {
  background: #fff3e2;
  color: #b56d1d;
}

.status-badge.rejected {
  background: #feecec;
  color: #c43d39;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.history-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.history-footer {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #54675e;
  font-size: 13px;
}

.empty-state {
  border: 1px dashed #d6e2db;
  border-radius: 16px;
  padding: 22px;
  text-align: center;
  color: #6c7d75;
  background: #fbfdfc;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.24);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  z-index: 1050;
}

.modal-xl {
  width: min(96vw, 1360px);
  max-width: 96vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #e6ece9;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #214332;
}

.close-btn {
  border: none;
  background: transparent;
  color: #214332;
  font-size: 14px;
  cursor: pointer;
}

.modal-body {
  padding: 22px 32px;
  overflow-y: auto;
  background: #f4f6f5;
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

.flow-section,
.history-section,
.attach-section {
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

.flow-section {
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

.modal-footer {
  padding: 18px;
  background: #e6ece9;
  text-align: center;
}

.btn {
  margin: 0 8px;
  padding: 8px 22px;
  border: none;
  border-radius: 22px;
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
  .hero-card,
  .quick-grid,
  .history-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-xl {
    width: 95vw;
  }
}

@media (max-width: 768px) {
  .hero-card,
  .panel-card {
    padding: 20px;
  }

  .hero-copy h1 {
    line-height: 1.08;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .panel-head,
  .activity-item,
  .history-top,
  .history-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .activity-side {
    align-items: flex-start;
  }

  .modal-body {
    padding: 18px 16px;
  }

  .flow-track {
    display: none;
  }
}

@media (max-width: 560px) {
  .dashboard-shell {
    gap: 16px;
  }

  .hero-card,
  .panel-card {
    padding: 16px;
    border-radius: 16px;
  }

  .panel-link {
    width: 100%;
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
