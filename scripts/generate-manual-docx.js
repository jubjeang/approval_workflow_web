import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const screenshotsDir = path.join(root, 'docs', 'manual', 'screenshots')
const buildRoot = path.join(root, 'docs', 'manual', 'build')

const screenshots = {
  login: '01-login.png',
  dashboardRequester: '02-dashboard-requester.png',
  dashboardApprover: '03-dashboard-approver.png',
  approvalRequests: '04-approval-requests.png',
  createDocument: '05-create-document-modal.png',
  editReturned: '06-edit-returned-document.png',
  pendingApprovals: '07-pending-approvals.png',
  pendingDetail: '08-pending-approval-detail.png',
  history: '09-approval-history.png',
  historyDetail: '10-history-detail.png',
  publicApprove: '11-public-approve.png',
}

const manuals = {
  th: {
    output: 'Approval-Workflow-System-User-Manual-TH',
    title: 'คู่มือการใช้งานระบบ Approval Workflow System',
    subtitle:
      'เอกสารฉบับนี้จัดทำจากหน้าจอใช้งานจริงของระบบ ณ วันที่ 24 มีนาคม 2026 เพื่ออธิบายขั้นตอนการใช้งานสำหรับผู้สร้างเอกสาร ผู้อนุมัติ และผู้ใช้งานที่รับลิงก์จากอีเมล',
    sections: [
      {
        title: '1. ภาพรวมระบบและบทบาทผู้ใช้งาน',
        intro:
          'ระบบ Approval Workflow System ใช้สำหรับสร้างเอกสารคำขอ ส่งเอกสารเข้ากระบวนการอนุมัติ ติดตามสถานะ และอนุมัติผ่านหน้าในระบบหรือผ่านลิงก์จากอีเมล',
        notes: [
          'Requester ใช้สำหรับสร้าง แก้ไข และติดตามเอกสารของตนเอง',
          'Approver ใช้สำหรับตรวจสอบเอกสารที่รอการดำเนินการ และสามารถ Approve, Reject หรือ Return ได้',
          'ผู้รับลิงก์จากอีเมลสามารถเปิดหน้า Public Approval เพื่ออนุมัติจากลิงก์โดยตรง',
        ],
      },
      {
        title: '2. หน้าเข้าสู่ระบบ (Login)',
        intro:
          'หน้าจอเข้าสู่ระบบประกอบด้วยช่อง Username, Password และปุ่ม Sign In สำหรับเข้าสู่ระบบด้วยบัญชีผู้ใช้งานที่ได้รับสิทธิ์',
        steps: [
          'กรอก Username และ Password ให้ถูกต้อง',
          'กดปุ่ม Sign In เพื่อเข้าสู่ระบบ',
          'หากข้อมูลไม่ถูกต้อง ระบบจะแสดงข้อความผิดพลาดบนหน้าจอ',
        ],
        figure: { caption: 'รูปที่ 1 หน้าเข้าสู่ระบบ', file: screenshots.login },
      },
      {
        title: '3. หน้า Dashboard ของผู้สร้างเอกสาร',
        intro:
          'เมื่อเข้าสู่ระบบด้วยบทบาท Requester ระบบจะแสดง Dashboard ที่สรุปเอกสารของแผนก การ์ดสรุป และรายการกิจกรรมล่าสุด',
        steps: [
          'ตรวจสอบการ์ดสรุปยอดด้านบนของหน้า',
          'ดูรายการเอกสารล่าสุดของแผนกจากบล็อก Latest Department Documents',
          'ใช้ปุ่ม Open List หรือ View All เพื่อนำทางไปยังหน้ารายการที่เกี่ยวข้อง',
        ],
        figure: { caption: 'รูปที่ 2 Dashboard สำหรับ Requester', file: screenshots.dashboardRequester },
      },
      {
        title: '4. หน้า Dashboard ของผู้อนุมัติ',
        intro:
          'เมื่อเข้าสู่ระบบด้วยสิทธิ์ผู้อนุมัติ ระบบจะแสดงจำนวนงานที่รอการดำเนินการ เอกสารล่าสุด และ recent activity ที่เกี่ยวข้องกับบัญชีดังกล่าว',
        steps: [
          'ดูจำนวน Your Pending Items เพื่อประเมินจำนวนงานที่รออนุมัติ',
          'ตรวจสอบรายการในบล็อก Your Pending Approvals',
          'กด Open List เพื่อเปิดหน้า Pending Approvals โดยตรง',
        ],
        figure: { caption: 'รูปที่ 3 Dashboard สำหรับ Approver', file: screenshots.dashboardApprover },
      },
      {
        title: '5. หน้า Approval Requests',
        intro:
          'หน้า Approval Requests ใช้แสดงเอกสารของแผนกเดียวกับผู้ใช้งาน พร้อมช่องค้นหา การกรองสถานะ และรายการเอกสารในตาราง',
        steps: [
          'ใช้ Search เพื่อค้นหาจากเลขเอกสาร ชื่อรายการ หรือประเภทเอกสาร',
          'ใช้ Status เพื่อกรองเอกสารตามสถานะจริงของระบบ',
          'ตรวจสอบตารางเอกสารและใช้ปุ่ม Edit หรือ Delete ตามสิทธิ์และสถานะ',
        ],
        figure: { caption: 'รูปที่ 4 หน้า Approval Requests', file: screenshots.approvalRequests },
      },
      {
        title: '6. การสร้างเอกสารใหม่',
        intro:
          'Requester สามารถกด Create Document เพื่อเปิดแบบฟอร์มเพิ่มเอกสาร ซึ่งประกอบด้วย Document Type, ข้อมูลหัวเอกสาร, รายการสินค้า และไฟล์แนบ',
        steps: [
          'กดปุ่ม Create Document',
          'เลือก Document Type ให้ตรงกับประเภทเอกสาร',
          'กรอกข้อมูลหัวเอกสาร เช่น Country, Company, Request Date และ Project Title Description',
          'กรอกข้อมูลในตาราง Items ได้แก่ Project Description, Qty, Price และ Amount',
          'แนบไฟล์ในส่วน Attach File ตามความจำเป็น',
          'กด Save & Submit เพื่อส่งเข้า workflow หรือ Save Draft เพื่อบันทึกฉบับร่าง',
        ],
        figure: { caption: 'รูปที่ 5 หน้าต่าง Add Form', file: screenshots.createDocument },
      },
      {
        title: '7. การแก้ไขเอกสารที่ถูกส่งกลับ',
        intro:
          'เมื่อเอกสารถูก Return ผู้สร้างเอกสารสามารถเปิดแบบฟอร์ม Edit เพื่อแก้ไขข้อมูลเดิมและส่งใหม่ได้',
        steps: [
          'ค้นหาเอกสารที่มีผลลัพธ์เป็น Returned',
          'กดปุ่ม Edit เพื่อเปิดหน้าต่างแก้ไข',
          'แก้ไขข้อมูลที่จำเป็น เช่น รายละเอียดโครงการ รายการสินค้า หรือไฟล์แนบ',
          'กด Save & Submit เพื่อส่งเอกสารกลับเข้าสู่ workflow',
        ],
        notes: [
          'Document Type ถูกล็อกไม่ให้เปลี่ยนสำหรับเอกสารที่ถูก Return',
        ],
        figure: { caption: 'รูปที่ 6 หน้าต่าง Edit Form สำหรับเอกสารที่ถูก Return', file: screenshots.editReturned },
      },
      {
        title: '8. หน้า Pending Approvals',
        intro:
          'ผู้อนุมัติใช้หน้า Pending Approvals เพื่อดูรายการเอกสารที่อยู่ในขั้นตอนที่ต้องดำเนินการในลำดับของตน',
        steps: [
          'ใช้ Search เพื่อค้นหาเลขเอกสาร ชื่อรายการ ผู้ขอ หรือแผนก',
          'ใช้ Status เพื่อกรองผลลัพธ์',
          'กดปุ่ม Open เพื่อเปิดรายละเอียดเอกสารสำหรับอนุมัติ',
        ],
        figure: { caption: 'รูปที่ 7 หน้า Pending Approvals', file: screenshots.pendingApprovals },
      },
      {
        title: '9. การอนุมัติจากหน้า Pending Detail',
        intro:
          'หน้าต่าง Approval Detail จะแสดงข้อมูลหัวเอกสาร รายการสินค้า Remark ไฟล์แนบ และ Approval Steps แบบ navigator เพื่อช่วยให้ผู้อนุมัติพิจารณาเอกสารได้ครบถ้วน',
        steps: [
          'ตรวจสอบข้อมูลเอกสารและรายการสินค้า',
          'อ่าน Remark และ Approval History ที่เกี่ยวข้อง',
          'ดู Approval Steps เพื่อทราบว่าขณะนี้เอกสารอยู่ในลำดับใด',
          'กรอก Remark หากจะ Reject หรือ Return',
          'กด Approve, Reject หรือ Return ตามผลการพิจารณา',
        ],
        figure: { caption: 'รูปที่ 8 หน้าต่าง Approval Detail สำหรับผู้อนุมัติ', file: screenshots.pendingDetail },
      },
      {
        title: '10. หน้า Approval History',
        intro:
          'หน้า Approval History ใช้ติดตามเอกสารที่ผู้ใช้งานเคยดำเนินการ หรือเอกสารของตนที่มีความเคลื่อนไหวล่าสุด พร้อม summary card และตัวกรองด้านบน',
        steps: [
          'ตรวจสอบการ์ดสรุป Approved, Returned, Rejected และ In Progress',
          'ใช้ Search และ Status เพื่อค้นหารายการย้อนหลัง',
          'กด Open เพื่อดูรายละเอียดเอกสารแต่ละรายการ',
        ],
        figure: { caption: 'รูปที่ 9 หน้า Approval History', file: screenshots.history },
      },
      {
        title: '11. รายละเอียดเอกสารจากหน้า Approval History',
        intro:
          'เมื่อเปิดเอกสารจากหน้า Approval History ระบบจะแสดงหน้าต่างแบบอ่านอย่างเดียว พร้อม Approval Steps และ Approval History สำหรับตรวจสอบย้อนหลัง',
        steps: [
          'ตรวจสอบข้อมูลหัวเอกสาร รายการสินค้า และไฟล์แนบ',
          'ดู Approval Steps เพื่อทราบว่าแต่ละลำดับอยู่ในสถานะใด',
          'ตรวจสอบ Approval History เพื่อดูเวลา ผู้ดำเนินการ และหมายเหตุย้อนหลัง',
        ],
        figure: { caption: 'รูปที่ 10 หน้าต่าง Approval Detail จากหน้า History', file: screenshots.historyDetail },
      },
      {
        title: '12. การอนุมัติผ่านลิงก์จากอีเมล',
        intro:
          'เมื่อระบบส่งอีเมลแจ้งอนุมัติ ผู้รับสามารถคลิกลิงก์เพื่อเปิดหน้า Public Approval ได้โดยตรง โดยไม่ต้องเข้าผ่านเมนูหลักของระบบ',
        steps: [
          'เปิดอีเมลแจ้งอนุมัติและคลิกลิงก์เอกสาร',
          'ตรวจสอบข้อมูลหัวเอกสาร รายการสินค้า และ Approval Steps',
          'กรอก Remark หากต้องการ Reject หรือ Return',
          'กด Approve, Reject หรือ Return ตามผลการพิจารณา',
        ],
        notes: [
          'หากลิงก์หมดอายุ ถูกใช้ไปแล้ว หรือถูก revoke ระบบจะไม่อนุญาตให้ดำเนินการต่อ',
        ],
        figure: { caption: 'รูปที่ 11 หน้า Public Approval จากลิงก์อีเมล', file: screenshots.publicApprove },
      },
      {
        title: '13. ความหมายของสถานะในระบบ',
        notes: [
          'Draft: เอกสารถูกบันทึกไว้แต่ยังไม่ถูกส่งเข้า workflow',
          'Inprocess: เอกสารถูกส่งเข้า workflow แล้ว และกำลังรอการดำเนินการในขั้นตอนปัจจุบัน',
          'Approved: เอกสารถูกอนุมัติครบทุกขั้นตอนแล้ว',
          'Returned: เอกสารถูกส่งกลับให้ผู้สร้างแก้ไขและส่งใหม่',
          'Rejected: เอกสารถูกปฏิเสธและ workflow สิ้นสุด',
        ],
      },
      {
        title: '14. ข้อแนะนำในการใช้งาน',
        notes: [
          'ควรระบุรายละเอียดโครงการและข้อมูลรายการสินค้าให้ครบก่อนส่งอนุมัติ',
          'เมื่อเอกสารถูก Return ควรอ่าน Remark ของผู้อนุมัติทุกครั้งก่อนแก้ไข',
          'หากอนุมัติผ่านลิงก์อีเมล ควรดำเนินการภายในเวลาที่ลิงก์ยังไม่หมดอายุ',
          'ควรใช้หน้า Approval History เพื่อตรวจสอบผลย้อนหลังและติดตามเวลาการดำเนินการของแต่ละขั้นตอน',
        ],
      },
    ],
  },
  en: {
    output: 'Approval-Workflow-System-User-Manual-EN',
    title: 'Approval Workflow System User Manual',
    subtitle:
      'This manual was prepared from live system screens captured on March 24, 2026. It documents the workflow for requesters, approvers, and users who act from approval links sent by email.',
    sections: [
      {
        title: '1. System Overview and User Roles',
        intro:
          'Approval Workflow System is used to create request documents, submit them into an approval workflow, monitor status, and perform approval actions either inside the application or from a public email link.',
        notes: [
          'Requester users can create, edit, and monitor their own documents.',
          'Approver users can review pending documents and perform Approve, Reject, or Return.',
          'Users who receive the email link can open the Public Approval page directly and act on the document.',
        ],
      },
      {
        title: '2. Login Screen',
        intro:
          'The login screen contains the Username field, Password field, and Sign In button used to access the system with an authorized account.',
        steps: [
          'Enter a valid Username and Password.',
          'Click Sign In to enter the system.',
          'If the credentials are invalid, the system shows an on-screen error message.',
        ],
        figure: { caption: 'Figure 1. Login screen', file: screenshots.login },
      },
      {
        title: '3. Requester Dashboard',
        intro:
          'When signed in as a requester, the dashboard displays summary cards, department documents, and recent activity to help track work quickly.',
        steps: [
          'Review the summary cards at the top of the page.',
          'Check the Latest Department Documents panel on the right side.',
          'Use Open List or View All to navigate to related pages.',
        ],
        figure: { caption: 'Figure 2. Requester dashboard', file: screenshots.dashboardRequester },
      },
      {
        title: '4. Approver Dashboard',
        intro:
          'When signed in with approval permissions, the dashboard shows pending item counts, pending tasks, and recent actions related to the approver account.',
        steps: [
          'Review Your Pending Items to see how many documents require action.',
          'Inspect the Your Pending Approvals block.',
          'Use Open List to navigate directly to the pending approvals page.',
        ],
        figure: { caption: 'Figure 3. Approver dashboard', file: screenshots.dashboardApprover },
      },
      {
        title: '5. Approval Requests Page',
        intro:
          'The Approval Requests page lists request documents from the same department as the signed-in user and provides search, filtering, edit, and delete actions based on status and permission.',
        steps: [
          'Use Search to find a document by document number, title, or document type.',
          'Use Status to filter the list by available system statuses.',
          'Review the table and use Edit or Delete according to permission and current document status.',
        ],
        figure: { caption: 'Figure 4. Approval Requests page', file: screenshots.approvalRequests },
      },
      {
        title: '6. Creating a New Document',
        intro:
          'Requesters can click Create Document to open the add form. The form includes document type selection, header information, item lines, and attachments.',
        steps: [
          'Click Create Document.',
          'Select the appropriate Document Type.',
          'Enter the header values such as Country, Company, Request Date, and Project Title Description.',
          'Enter item details in the Items table, including Project Description, Qty, Price, and Amount.',
          'Attach supporting files in the Attach File section when required.',
          'Click Save & Submit to start the workflow or Save Draft to keep a draft copy.',
        ],
        figure: { caption: 'Figure 5. Add Form used to create a new document', file: screenshots.createDocument },
      },
      {
        title: '7. Editing a Returned Document',
        intro:
          'When a document is returned, the requester can reopen the form, revise the existing data, and submit the document again.',
        steps: [
          'Locate the document whose latest result is Returned.',
          'Click Edit to open the edit form.',
          'Update the necessary fields, item lines, or attachments.',
          'Click Save & Submit to return the document to the workflow.',
        ],
        notes: [
          'Document Type is locked and cannot be changed for returned documents.',
        ],
        figure: { caption: 'Figure 6. Edit Form for a returned document', file: screenshots.editReturned },
      },
      {
        title: '8. Pending Approvals Page',
        intro:
          'Approvers use the Pending Approvals page to review the documents currently assigned to their workflow step.',
        steps: [
          'Use Search to find a document by document number, title, requester, or department.',
          'Use Status to narrow the list.',
          'Click Open for the document you want to review.',
        ],
        figure: { caption: 'Figure 7. Pending Approvals page', file: screenshots.pendingApprovals },
      },
      {
        title: '9. Acting from the Pending Detail Window',
        intro:
          'The Approval Detail window presents the document header, item list, remark field, attachments, and approval navigator so the approver can make a decision with full context.',
        steps: [
          'Review the header information and item details carefully.',
          'Read the remark and approval history when available.',
          'Inspect the Approval Steps navigator to understand the current workflow position.',
          'Enter a remark when rejecting or returning the document.',
          'Click Approve, Reject, or Return as needed.',
        ],
        figure: { caption: 'Figure 8. Pending approval detail window', file: screenshots.pendingDetail },
      },
      {
        title: '10. Approval History Page',
        intro:
          'The Approval History page summarizes documents the user has acted on and documents owned by the user that have recent workflow activity.',
        steps: [
          'Review the summary cards for Approved, Returned, Rejected, and In Progress.',
          'Use Search and Status to locate historical records.',
          'Click Open to inspect a document in detail.',
        ],
        figure: { caption: 'Figure 9. Approval History page', file: screenshots.history },
      },
      {
        title: '11. Approval History Detail Window',
        intro:
          'Opening a record from Approval History shows a read-only detail window with document information, attachments, approval steps, and approval history.',
        steps: [
          'Review the document header, item lines, and attachments.',
          'Use the Approval Steps navigator to see completed, returned, and waiting stages.',
          'Use the Approval History section to review timestamps, actors, actions, and remarks.',
        ],
        figure: { caption: 'Figure 10. History detail window', file: screenshots.historyDetail },
      },
      {
        title: '12. Approving from the Email Link',
        intro:
          'When the system sends an approval email, the approver can click the public link and open a standalone approval page without entering the main navigation.',
        steps: [
          'Open the approval email and click the document link.',
          'Review the document header, item details, and approval navigator.',
          'Enter a remark if you plan to Reject or Return.',
          'Click Approve, Reject, or Return to complete the action.',
        ],
        notes: [
          'If the public link is expired, already used, or revoked, the page will no longer allow action.',
        ],
        figure: { caption: 'Figure 11. Public approval page opened from email', file: screenshots.publicApprove },
      },
      {
        title: '13. Status Definitions',
        notes: [
          'Draft: The document is saved but has not been submitted into the workflow.',
          'Inprocess: The document is already in the workflow and is waiting at the current step.',
          'Approved: The document completed all approval steps successfully.',
          'Returned: The document was returned to the requester for revision and resubmission.',
          'Rejected: The document was rejected and the workflow ended.',
        ],
      },
      {
        title: '14. Usage Recommendations',
        notes: [
          'Provide a clear project title and complete item details before submitting a document.',
          'When a document is returned, always read the approver remark before editing.',
          'If acting from the email link, complete the action before the public token expires.',
          'Use Approval History to review previous actions and timestamps for every workflow step.',
        ],
      },
    ],
  },
}

let relCounter = 1
let docPrCounter = 1

const escapeXml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const pngSize = (buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20),
})

const pxToEmu = (px) => Math.round(px * 9525)

const pageWidthEmu = 6.4 * 914400

const paragraph = (text, options = {}) => {
  const escaped = escapeXml(text)
  const fontSize = options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : ''
  const bold = options.bold ? '<w:b/>' : ''
  const color = options.color ? `<w:color w:val="${options.color}"/>` : ''
  const keepNext = options.keepNext ? '<w:keepNext/>' : ''
  const spacingBefore = options.before != null ? `<w:spacing w:before="${options.before}" w:after="${options.after ?? 120}"/>` : ''
  const spacingFallback = options.before == null && options.after != null ? `<w:spacing w:after="${options.after}"/>` : ''
  const jc = options.align ? `<w:jc w:val="${options.align}"/>` : ''
  return `
    <w:p>
      <w:pPr>
        ${keepNext}
        ${spacingBefore || spacingFallback}
        ${jc}
      </w:pPr>
      <w:r>
        <w:rPr>
          ${bold}
          ${fontSize}
          ${color}
        </w:rPr>
        <w:t xml:space="preserve">${escaped}</w:t>
      </w:r>
    </w:p>
  `
}

const blankParagraph = (after = 80) => `
  <w:p>
    <w:pPr><w:spacing w:after="${after}"/></w:pPr>
  </w:p>
`

const imageParagraph = (buffer, fileName, label, rels, mediaTargets) => {
  const { width, height } = pngSize(buffer)
  const ratio = Math.min(1, pageWidthEmu / pxToEmu(width))
  const cx = Math.round(pxToEmu(width) * ratio)
  const cy = Math.round(pxToEmu(height) * ratio)
  const relId = `rId${relCounter++}`
  const docPrId = docPrCounter++
  mediaTargets.push({ fileName, buffer })
  rels.push(
    `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${escapeXml(fileName)}"/>`
  )

  return `
    <w:p>
      <w:pPr>
        <w:spacing w:before="80" w:after="80"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <wp:extent cx="${cx}" cy="${cy}"/>
            <wp:docPr id="${docPrId}" name="${escapeXml(label)}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:nvPicPr>
                    <pic:cNvPr id="0" name="${escapeXml(label)}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${relId}"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${cx}" cy="${cy}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
  `
}

const buildBody = (manual, rels, mediaTargets) => {
  const body = []
  body.push(paragraph(manual.title, { size: 34, bold: true, color: '135C31', after: 160 }))
  body.push(paragraph(manual.subtitle, { size: 22, color: '45685A', after: 220 }))

  manual.sections.forEach((section) => {
    body.push(paragraph(section.title, { size: 28, bold: true, color: '135C31', before: 220, after: 140, keepNext: true }))
    if (section.intro) {
      body.push(paragraph(section.intro, { size: 22, after: 120 }))
    }
    if (section.steps?.length) {
      section.steps.forEach((step, index) => {
        body.push(paragraph(`${index + 1}. ${step}`, { size: 22, after: 80 }))
      })
    }
    if (section.notes?.length) {
      section.notes.forEach((note) => {
        body.push(paragraph(`- ${note}`, { size: 22, after: 80 }))
      })
    }
    if (section.figure) {
      const fileName = section.figure.file
      const buffer = fs.readFileSync(path.join(screenshotsDir, fileName))
      body.push(paragraph(section.figure.caption, { size: 20, color: '5A7A6B', before: 120, after: 80, align: 'center' }))
      body.push(imageParagraph(buffer, fileName, section.figure.caption, rels, mediaTargets))
    }
    body.push(blankParagraph(120))
  })

  body.push(paragraph(`Generated from the current project workspace on ${new Date().toISOString().slice(0, 10)}.`, { size: 18, color: '5A7A6B', before: 180, after: 60 }))
  return body.join('\n')
}

const documentXml = (bodyXml) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1008" w:right="1008" w:bottom="1008" w:left="1008" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
`

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Tahoma" w:cs="Tahoma"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>
`

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
</Properties>
`

const coreXml = (title) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>
`

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
`

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
`

const buildManual = (lang, manual) => {
  relCounter = 1
  docPrCounter = 1
  const rels = [
    '<Relationship Id="rStyle" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
  ]
  const mediaTargets = []
  const bodyXml = buildBody(manual, rels, mediaTargets)

  const langRoot = path.join(buildRoot, lang)
  fs.rmSync(langRoot, { recursive: true, force: true })
  fs.mkdirSync(path.join(langRoot, '_rels'), { recursive: true })
  fs.mkdirSync(path.join(langRoot, 'docProps'), { recursive: true })
  fs.mkdirSync(path.join(langRoot, 'word', '_rels'), { recursive: true })
  fs.mkdirSync(path.join(langRoot, 'word', 'media'), { recursive: true })

  fs.writeFileSync(path.join(langRoot, '[Content_Types].xml'), contentTypesXml)
  fs.writeFileSync(path.join(langRoot, '_rels', '.rels'), rootRelsXml)
  fs.writeFileSync(path.join(langRoot, 'docProps', 'app.xml'), appXml)
  fs.writeFileSync(path.join(langRoot, 'docProps', 'core.xml'), coreXml(manual.title))
  fs.writeFileSync(path.join(langRoot, 'word', 'styles.xml'), stylesXml)
  fs.writeFileSync(path.join(langRoot, 'word', 'document.xml'), documentXml(bodyXml))
  fs.writeFileSync(
    path.join(langRoot, 'word', '_rels', 'document.xml.rels'),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels.join('\n  ')}
</Relationships>
`
  )

  mediaTargets.forEach(({ fileName, buffer }) => {
    fs.writeFileSync(path.join(langRoot, 'word', 'media', fileName), buffer)
  })
}

fs.mkdirSync(buildRoot, { recursive: true })
Object.entries(manuals).forEach(([lang, manual]) => buildManual(lang, manual))

console.log('Rebuilt Word packages with embedded images at', buildRoot)
