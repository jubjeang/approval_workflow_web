const base = '/manual/screenshots'

const shots = {
  login: `${base}/01-login.png`,
  dashboardRequester: `${base}/02-dashboard-requester.png`,
  dashboardApprover: `${base}/03-dashboard-approver.png`,
  approvalRequests: `${base}/04-approval-requests.png`,
  createDocument: `${base}/05-create-document-modal.png`,
  editReturned: `${base}/06-edit-returned-document.png`,
  pendingApprovals: `${base}/07-pending-approvals.png`,
  pendingDetail: `${base}/08-pending-approval-detail.png`,
  history: `${base}/09-approval-history.png`,
  historyDetail: `${base}/10-history-detail.png`,
  publicApprove: `${base}/11-public-approve.png`,
}

export const manualDownloads = {
  th: '/manual/output/Approval-Workflow-System-User-Manual-TH.docx',
  en: '/manual/output/Approval-Workflow-System-User-Manual-EN.docx',
}

export const manualContent = {
  th: {
    title: 'คู่มือการใช้งานระบบ Approval Workflow System',
    subtitle:
      'เอกสารฉบับนี้อธิบายการใช้งานระบบจากหน้าจอจริงของระบบ ทั้งสำหรับผู้สร้างเอกสาร ผู้อนุมัติ และผู้ที่อนุมัติผ่านลิงก์จากอีเมล',
    sections: [
      {
        title: '1. ภาพรวมระบบ',
        intro:
          'Approval Workflow System ใช้สำหรับสร้างเอกสารคำขอ ส่งเอกสารเข้ากระบวนการอนุมัติ ติดตามสถานะ และอนุมัติผ่านหน้าในระบบหรือผ่านลิงก์จากอีเมล',
        bullets: [
          'Requester ใช้สำหรับสร้าง แก้ไข และติดตามเอกสารของตนเอง',
          'Approver ใช้สำหรับตรวจสอบเอกสารที่รอการอนุมัติและดำเนินการ Approve, Reject หรือ Return',
          'Public Approver ใช้สำหรับเปิดลิงก์จากอีเมลและอนุมัติจากหน้า Public Approval',
        ],
      },
      {
        title: '2. หน้าเข้าสู่ระบบ (Login)',
        intro: 'หน้าจอเข้าสู่ระบบประกอบด้วย Username, Password และปุ่ม Sign In',
        steps: [
          'กรอก Username และ Password ให้ถูกต้อง',
          'กดปุ่ม Sign In เพื่อเข้าสู่ระบบ',
          'หากข้อมูลไม่ถูกต้อง ระบบจะแสดงข้อความผิดพลาดบนหน้าจอ',
        ],
        image: shots.login,
        caption: 'รูปที่ 1 หน้าเข้าสู่ระบบ',
      },
      {
        title: '3. Dashboard สำหรับ Requester',
        intro: 'หน้า Dashboard ของ Requester ใช้สำหรับดูภาพรวมเอกสารล่าสุดของแผนกและสถานะงานที่เกี่ยวข้อง',
        steps: [
          'ตรวจสอบการ์ดสรุปยอดด้านบน',
          'ดูรายการ Latest Department Documents',
          'ใช้ปุ่ม Open List หรือ View All เพื่อไปยังหน้ารายการที่เกี่ยวข้อง',
        ],
        image: shots.dashboardRequester,
        caption: 'รูปที่ 2 Dashboard สำหรับ Requester',
      },
      {
        title: '4. Dashboard สำหรับ Approver',
        intro: 'Dashboard ของผู้อนุมัติจะแสดงจำนวนงานรออนุมัติ เอกสารล่าสุด และประวัติการดำเนินการล่าสุด',
        steps: [
          'ดูจำนวน Your Pending Items',
          'ตรวจสอบ Your Pending Approvals',
          'กด Open List เพื่อเปิดหน้ารายการรออนุมัติ',
        ],
        image: shots.dashboardApprover,
        caption: 'รูปที่ 3 Dashboard สำหรับ Approver',
      },
      {
        title: '5. หน้า Approval Requests',
        intro: 'หน้านี้ใช้สำหรับดูรายการเอกสารคำขอของแผนกผู้ใช้งาน พร้อมช่องค้นหาและกรองสถานะ',
        steps: [
          'ใช้ Search เพื่อค้นหาเลขเอกสาร ชื่อรายการ หรือประเภทเอกสาร',
          'ใช้ Status เพื่อกรองเอกสารตามสถานะ',
          'ใช้ปุ่ม Edit หรือ Delete ตามสิทธิ์และสถานะเอกสาร',
        ],
        image: shots.approvalRequests,
        caption: 'รูปที่ 4 หน้า Approval Requests',
      },
      {
        title: '6. การสร้างเอกสารใหม่',
        intro: 'Requester สามารถกด Create Document เพื่อเปิดแบบฟอร์มเพิ่มเอกสารใหม่',
        steps: [
          'เลือก Document Type',
          'กรอกข้อมูลหัวเอกสาร เช่น Country, Company, Request Date และ Project Title Description',
          'กรอก Items ให้ครบ',
          'แนบไฟล์ในส่วน Attach File',
          'กด Save & Submit หรือ Save Draft',
        ],
        image: shots.createDocument,
        caption: 'รูปที่ 5 หน้าต่าง Add Form',
      },
      {
        title: '7. การแก้ไขเอกสารที่ถูก Return',
        intro: 'เมื่อเอกสารถูก Return ผู้สร้างเอกสารสามารถเปิด Edit Form เพื่อแก้ไขและส่งใหม่ได้',
        steps: [
          'ค้นหาเอกสารที่มีผลลัพธ์ Returned',
          'กด Edit เพื่อเปิดแบบฟอร์มแก้ไข',
          'แก้ไขข้อมูลที่จำเป็นและส่งใหม่',
        ],
        bullets: ['Document Type ถูกล็อกไม่ให้เปลี่ยนสำหรับเอกสารที่ถูก Return'],
        image: shots.editReturned,
        caption: 'รูปที่ 6 Edit Form สำหรับเอกสารที่ถูก Return',
      },
      {
        title: '8. หน้า Pending Approvals',
        intro: 'ผู้อนุมัติใช้หน้านี้สำหรับดูรายการเอกสารที่รอการดำเนินการในขั้นตอนของตน',
        steps: [
          'ค้นหาเอกสารจาก Search',
          'กรองผลลัพธ์จาก Status',
          'กด Open เพื่อเปิดรายละเอียดเอกสาร',
        ],
        image: shots.pendingApprovals,
        caption: 'รูปที่ 7 หน้า Pending Approvals',
      },
      {
        title: '9. การอนุมัติจากหน้ารายละเอียด',
        intro: 'เมื่อเปิดเอกสารจาก Pending Approvals ระบบจะแสดงข้อมูลเอกสาร รายการสินค้า Remark ไฟล์แนบ และ Approval Steps',
        steps: [
          'ตรวจสอบข้อมูลหัวเอกสารและรายการสินค้า',
          'ดู Approval Steps และ Approval History',
          'กรอก Remark หากต้องการ Reject หรือ Return',
          'กด Approve, Reject หรือ Return',
        ],
        image: shots.pendingDetail,
        caption: 'รูปที่ 8 หน้าต่าง Approval Detail สำหรับผู้อนุมัติ',
      },
      {
        title: '10. หน้า Approval History',
        intro: 'หน้า Approval History ใช้สำหรับดูประวัติเอกสารที่เคยดำเนินการหรือมีความเคลื่อนไหวล่าสุด',
        steps: [
          'ตรวจสอบ summary cards',
          'ใช้ Search และ Status เพื่อค้นหารายการย้อนหลัง',
          'กด Open เพื่อดูรายละเอียดเอกสาร',
        ],
        image: shots.history,
        caption: 'รูปที่ 9 หน้า Approval History',
      },
      {
        title: '11. รายละเอียดจากหน้า History',
        intro: 'เมื่อเปิดเอกสารจาก History ระบบจะแสดงรายละเอียดแบบอ่านอย่างเดียว พร้อม Approval Steps และ Approval History',
        steps: [
          'ตรวจสอบข้อมูลหัวเอกสาร รายการสินค้า และไฟล์แนบ',
          'ดู Approval Steps เพื่อเข้าใจลำดับ workflow',
          'ดู Approval History เพื่อเช็กเวลา ผู้ดำเนินการ และหมายเหตุย้อนหลัง',
        ],
        image: shots.historyDetail,
        caption: 'รูปที่ 10 หน้าต่าง Approval Detail จาก History',
      },
      {
        title: '12. การอนุมัติผ่านลิงก์จากอีเมล',
        intro: 'ผู้รับอีเมลสามารถเปิดลิงก์เอกสารและอนุมัติจากหน้า Public Approval ได้โดยตรง',
        steps: [
          'เปิดอีเมลและคลิกลิงก์เอกสาร',
          'ตรวจสอบรายละเอียดเอกสาร',
          'กรอก Remark หากต้องการ Reject หรือ Return',
          'กด Approve, Reject หรือ Return',
        ],
        image: shots.publicApprove,
        caption: 'รูปที่ 11 หน้า Public Approval',
      },
      {
        title: '13. ความหมายของสถานะ',
        bullets: [
          'Draft: เอกสารถูกบันทึกไว้แต่ยังไม่ถูกส่งเข้า workflow',
          'Inprocess: เอกสารถูกส่งเข้า workflow แล้วและกำลังรอการดำเนินการ',
          'Approved: เอกสารถูกอนุมัติครบทุกขั้นตอนแล้ว',
          'Returned: เอกสารถูกส่งกลับให้ผู้สร้างแก้ไข',
          'Rejected: เอกสารถูกปฏิเสธและ workflow สิ้นสุด',
        ],
      },
    ],
  },
  en: {
    title: 'Approval Workflow System User Manual',
    subtitle:
      'This guide explains the live workflow screens for requesters, approvers, and users who act from public approval links sent by email.',
    sections: [
      {
        title: '1. System Overview',
        intro:
          'Approval Workflow System is used to create request documents, submit them into an approval workflow, monitor status, and act either inside the application or from a public email link.',
        bullets: [
          'Requester users can create, edit, and monitor their own documents.',
          'Approver users can review pending documents and perform Approve, Reject, or Return.',
          'Public approvers can open the email link and act from the Public Approval page.',
        ],
      },
      {
        title: '2. Login Screen',
        intro: 'The login screen contains Username, Password, and the Sign In button.',
        steps: [
          'Enter a valid Username and Password.',
          'Click Sign In to access the system.',
          'If the credentials are invalid, the system displays an error message.',
        ],
        image: shots.login,
        caption: 'Figure 1. Login screen',
      },
      {
        title: '3. Requester Dashboard',
        intro: 'The requester dashboard provides a summary of department documents and recent activity.',
        steps: [
          'Review the summary cards at the top.',
          'Check the Latest Department Documents panel.',
          'Use Open List or View All to navigate to the related pages.',
        ],
        image: shots.dashboardRequester,
        caption: 'Figure 2. Requester dashboard',
      },
      {
        title: '4. Approver Dashboard',
        intro: 'The approver dashboard shows pending items, recent actions, and quick access to current tasks.',
        steps: [
          'Review the Your Pending Items card.',
          'Check the Your Pending Approvals block.',
          'Use Open List to navigate to the pending approvals page.',
        ],
        image: shots.dashboardApprover,
        caption: 'Figure 3. Approver dashboard',
      },
      {
        title: '5. Approval Requests Page',
        intro: 'This page lists request documents from the same department as the signed-in user.',
        steps: [
          'Use Search to find a document by number, title, or document type.',
          'Use Status to filter the list.',
          'Use Edit or Delete according to the document status and permission.',
        ],
        image: shots.approvalRequests,
        caption: 'Figure 4. Approval Requests page',
      },
      {
        title: '6. Creating a New Document',
        intro: 'Requesters can click Create Document to open the add form.',
        steps: [
          'Select a Document Type.',
          'Fill in the document header fields.',
          'Complete the Items table.',
          'Attach files in the Attach File section.',
          'Click Save & Submit or Save Draft.',
        ],
        image: shots.createDocument,
        caption: 'Figure 5. Add Form',
      },
      {
        title: '7. Editing a Returned Document',
        intro: 'When a document is returned, the requester can edit it and submit it again.',
        steps: [
          'Locate the returned document.',
          'Click Edit to open the form.',
          'Update the required information and resubmit.',
        ],
        bullets: ['Document Type is locked for returned documents.'],
        image: shots.editReturned,
        caption: 'Figure 6. Edit Form for a returned document',
      },
      {
        title: '8. Pending Approvals Page',
        intro: 'Approvers use this page to review documents assigned to their workflow step.',
        steps: [
          'Search by document number, title, requester, or department.',
          'Filter the list using Status.',
          'Click Open to review the document.',
        ],
        image: shots.pendingApprovals,
        caption: 'Figure 7. Pending Approvals page',
      },
      {
        title: '9. Acting from the Detail Window',
        intro: 'The detail window shows document information, items, remark, attachments, and the approval navigator.',
        steps: [
          'Review the document header and item details.',
          'Check Approval Steps and Approval History.',
          'Enter a remark when rejecting or returning.',
          'Click Approve, Reject, or Return.',
        ],
        image: shots.pendingDetail,
        caption: 'Figure 8. Approval detail window',
      },
      {
        title: '10. Approval History Page',
        intro: 'Approval History is used to review past actions and recent document activity.',
        steps: [
          'Review the summary cards.',
          'Use Search and Status to filter records.',
          'Click Open to inspect a record in detail.',
        ],
        image: shots.history,
        caption: 'Figure 9. Approval History page',
      },
      {
        title: '11. History Detail Window',
        intro: 'The history detail window shows the document in read-only mode, including approval steps and action history.',
        steps: [
          'Review the header, items, and attachments.',
          'Use the approval navigator to understand the workflow sequence.',
          'Read the action history for timestamps, actors, and remarks.',
        ],
        image: shots.historyDetail,
        caption: 'Figure 10. History detail window',
      },
      {
        title: '12. Approving from the Email Link',
        intro: 'Users who receive an approval email can open the public approval page directly from the link.',
        steps: [
          'Open the email and click the document link.',
          'Review the document details.',
          'Enter a remark if you plan to Reject or Return.',
          'Click Approve, Reject, or Return.',
        ],
        image: shots.publicApprove,
        caption: 'Figure 11. Public approval page',
      },
      {
        title: '13. Status Definitions',
        bullets: [
          'Draft: The document is saved but not yet submitted into the workflow.',
          'Inprocess: The document is already in the workflow and waiting for action.',
          'Approved: The document completed all approval steps successfully.',
          'Returned: The document was returned to the requester for revision.',
          'Rejected: The document was rejected and the workflow ended.',
        ],
      },
    ],
  },
}
