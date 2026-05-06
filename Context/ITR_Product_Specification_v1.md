▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

**PRODUCT SPECIFICATION DOCUMENT**

**ITR Filing Management Platform**

*Custom Web Application --- Version 1.0*

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

  -------------------- -------------------------
      **Prepared for** **Geetanjali Jojare &
                       Associates**

  **Document Version** v1.0 --- April 2026

    **Classification** **Confidential --- Client
                       Use Only**
  -------------------- -------------------------

**TASK 1 --- CORE FUNCTION**

**1.1 Single Most Valuable Function**

The app\'s single most valuable function is: centralised, structured
intake and delivery of ITR filing engagements --- replacing fragmented
WhatsApp/email/Excel workflows with a single platform where clients
submit data and documents, staff processes returns, the owner approves,
and output is delivered --- all tracked, audited, and stored in one
place.

+-----------------------------------------------------------------+
| **WHY THIS MATTERS MOST TO THE BUSINESS**                       |
|                                                                 |
| Without this function, every other feature is irrelevant. Today |
| the firm loses productive hours to manual document chasing,     |
| version confusion, and missed communications. This function     |
| creates a repeatable, scalable service delivery engine that can |
| grow the firm\'s client base without proportional growth in     |
| administrative burden.                                          |
+-----------------------------------------------------------------+

**1.2 App Purpose Statement**

A mobile-first ITR filing management platform for a CA firm, enabling
structured client onboarding, document collection, query management,
owner-approved work delivery, and real-time status tracking ---
eliminating dependence on WhatsApp, email, and Excel for service
delivery.

**1.3 Problem Being Solved**

- Client data arrives via WhatsApp, email, and verbal communication ---
  no single intake channel

- Documents are scattered across devices, no centralised repository

- No structured query system between staff and clients

- No real-time status visibility for clients or the owner

- No formal record of client consent for ITR portal upload

- No audit trail of who did what and when

- Staff reminders and client follow-ups are manual

**TASK 2 --- USER ROLES & PERMISSIONS (RBAC)**

  --------------------- ----------------- ----------------- -----------------
     **PERMISSION /     **OWNER / ADMIN**     **STAFF**        **CLIENT**
        ACTION**                                            

  **Register clients**       ✅ Full         ✅ Limited     ✅ Self-register
                                           (self-register   
                                          only by default;  
                                              owner can     
                                          register clients  
                                              manually)     

    **Login method**    Email + Password   Google Account   Email + Password
                                             (individual      or Auto-ID +
                                               login)           Password

    **View all client    ✅ All clients   ✅ Assigned work   ❌ Own records
         data**                                orders             only

    **Create ITR work          ✅                ❌         ✅ Self-initiate
         order**                                            

   **View service plan         ✅                ✅               ⚠️ On
        pricing**                                           pull/request only

         **Apply        ✅ Create & apply        ❌          ✅ Apply valid
    discount/coupon**                                          coupon only

   **Receive payment**   ✅ Via GPay QR          N/A         ✅ Pay via GPay
                                                                   QR

  **Upload documents**         ✅         ✅ Delivery docs      ✅ Source
                                                                documents

       **Download              ✅                ✅         ✅ Own docs only
       documents**                                          

   **Raise queries to          ✅                ✅                ❌
        client**                                            

  **Reply to queries**         ✅                ✅          ✅ Own queries
                                                                  only

      **Update work            ✅                ✅                ❌
        status**                                            

     **Approve work       ✅ Mandatory           ❌                ❌
       delivery**                                           

     **Deliver final      ✅ After own      ✅ Submit for          ❌
      ITR/output**          approval          approval      

        **Update               ✅                ✅                ❌
   e-Return/Intimation                                      
        status**                                            

  **View work status**       ✅ All        ✅ All assigned     ✅ Own only

         **Give                ❌                ❌                ✅
    feedback/rating**                                       

         **View                ✅                ❌            ✅ Own only
   feedback/ratings**                                       

     **Delete data**           ✅                ❌                ❌

   **View audit log**          ✅                ❌                ❌

     **Manage staff            ✅                ❌                ❌
       accounts**                                           

         **View                ✅                ❌                ❌
   reports/dashboard**                                      
  --------------------- ----------------- ----------------- -----------------

**2.1 Role Definitions**

**Role: Owner / Admin**

- Full system access including data deletion and audit log

- Must approve all work deliveries before release to client

- Registers clients manually when required

- Manages discount codes and service pricing

- Views consolidated dashboard: work pipeline, pending approvals,
  revenue

- Updates e-Return processing status and Intimation on behalf of clients

**Role: Staff (2 users, individual Google login)**

- Downloads client-submitted documents and details for ITR preparation

- Raises structured queries to clients; replies to client responses

- Updates work status at each processing milestone

- Uploads final ITR, computation of income, and supporting notes for
  owner approval

- Cannot delete data, cannot approve own work, cannot view financial
  reports

- Receives automated email reminders on new work orders

**Role: Client / Customer**

- Self-registers or is registered by owner

- Initiates ITR work order: selects FY, entity type, income type,
  service plan

- Pays fees upfront via GPay QR code

- Uploads income-specific documents and fills structured questionnaires

- Views pricing only on explicit request (pull model, not default
  display)

- Replies to staff queries; tracks own work status

- Receives and downloads final output documents (ITR, computation,
  acknowledgement or XML/JSON)

- Submits feedback and star rating post-delivery

**TASK 3 --- DATA ARCHITECTURE**

**3.1 Data Entity Map**

**Entity: USER**

  -------------------- ------------------------------ -------------------
       **FIELD**              **DESCRIPTION**              **NOTES**

      **user_id**           Auto-generated UUID               PK

        **role**        ENUM: owner / staff / client       Required

        **name**              Full legal name              Required

       **email**              Unique, indexed              Required

   **google_account**      For staff OAuth login          Staff only

   **password_hash**            bcrypt hash              Client/Owner

     **mobile_no**           10-digit verified             Required

     **is_active**                Boolean                Default: true

   **registered_by**          owner_id or self             Required

     **created_at**              Timestamp                   Auto

     **updated_at**              Timestamp                   Auto
  -------------------- ------------------------------ -------------------

**Relationships:** *Connects to: ClientProfile, WorkOrder, AuditLog*

**Entity: CLIENT PROFILE**

  ------------------------------ ------------------------------ -------------------
            **FIELD**                   **DESCRIPTION**              **NOTES**

          **profile_id**                      UUID                      PK

           **user_id**                     FK → User                 Required

          **pan_number**               Encrypted AES-256             Required

      **aadhaar_encrypted**      AES-256 encrypted; stored only     Conditional
                                    with consent flag = TRUE    

       **aadhaar_consent**            Boolean + timestamp       Required if Aadhaar
                                                                      stored

         **fathers_name**                  Plain text             Individual only

     **residential_address**               Plain text                Required

          **tax_regime**                ENUM: new / old         Required per order

    **bank_details_encrypted**    JSON encrypted: name, IFSC,        Required
                                        acct_no, branch,        
                                     preferred_refund_bank      

   **it_portal_password_vault**    AES-256 + vault key; never        Required
                                   displayed in UI after save   

    **data_consent_accepted**    Boolean + timestamp + version       Required

    **privacy_policy_version**           Version string              Required
  ------------------------------ ------------------------------ -------------------

**Relationships:** *Connects to: User, WorkOrder*

**Entity: WORK ORDER (ITR REQUEST)**

  ------------------------------ ------------------------------ -------------------
            **FIELD**                   **DESCRIPTION**              **NOTES**

           **order_id**              Auto-generated unique              PK
                                           reference            

          **client_id**                    FK → User                 Required

        **financial_year**            ENUM: FY2024-25 etc.           Required

         **entity_type**            ENUM: Individual / NRI /         Required
                                 Partnership / Pvt Ltd / Public 
                                      Ltd / Trust-AOP-BOI       

         **income_types**              Multi-select array            Required

       **service_plan_id**              FK → ServicePlan             Required

     **original_or_revised**        ENUM: Original / Revised         Required

   **it_portal_upload_consent**   Boolean --- explicit consent       Required
                                    for staff to upload ITR     

            **status**             ENUM: Initiated / Payment       Auto-updated
                                    Pending / Payment Done /    
                                 Documents Pending / In Process 
                                 / Query Raised / Query Replied 
                                 / Pending Approval / ITR Filed 
                                    / e-Return Processing /     
                                     Intimation Received /      
                                           Completed            

      **assigned_staff_id**            FK → User (staff)         Assigned by owner

          **payment_id**                  FK → Payment               Required

   **created_at / updated_at**             Timestamps                  Auto
  ------------------------------ ------------------------------ -------------------

**Relationships:** *Connects to: User, ServicePlan, Payment, Document,
Query, WorkDelivery, AuditLog*

**Entity: SERVICE PLAN**

  ----------------------------- ------------------------------ -------------------
            **FIELD**                  **DESCRIPTION**              **NOTES**

           **plan_id**                       UUID                      PK

          **plan_name**              e.g., Simple Return,           Required
                                  Simple+Capital Gain, etc.    

         **description**           Applicable income types          Required

       **base_price_inr**                  Decimal                  Required

   **applicable_income_types**              Array                   Required

          **is_active**                    Boolean                Default: true

         **created_at**                   Timestamp                   Auto
  ----------------------------- ------------------------------ -------------------

**Relationships:** *Connects to: WorkOrder, Discount*

**Entity: PAYMENT**

  -------------------------- ------------------------------ -------------------
          **FIELD**                 **DESCRIPTION**              **NOTES**

        **payment_id**                    UUID                      PK

         **order_id**                FK → WorkOrder              Required

        **client_id**                  FK → User                 Required

        **amount_inr**         Decimal (after discount if        Required
                                          any)              

   **original_amount_inr**        Pre-discount amount            Required

     **discount_applied**        FK → Discount or NULL          Conditional

      **payment_method**             ENUM: GPay_QR           Default: GPay_QR

   **gpay_transaction_ref**   Alphanumeric reference from        Required
                                          GPay              

      **payment_status**      ENUM: Pending / Confirmed /        Required
                             Refund Initiated / Refunded /  
                                        Disputed            

    **refund_amount_inr**         50% of amount_inr if          Conditional
                                       applicable           

      **refund_reason**                   Text                  Conditional

       **payment_date**                Timestamp                   Auto

       **confirmed_by**         FK → User (owner/staff)          Required
  -------------------------- ------------------------------ -------------------

**Relationships:** *Connects to: WorkOrder, User, Discount*

**Entity: DISCOUNT / COUPON**

  -------------------------- ------------------------------ -------------------
          **FIELD**                 **DESCRIPTION**              **NOTES**

       **discount_id**                    UUID                      PK

       **coupon_code**            Unique alphanumeric            Required

      **discount_type**             ENUM: percentage        Fixed per framework

     **discount_percent**     Decimal (e.g., 10.00 = 10%)        Required

   **applicable_plan_ids**      Array of plan_ids or ALL         Required

   **applicable_client_id**    FK → User or NULL (global)      Per-client or
                                                                 universal

        **valid_from**                    Date                   Required

       **valid_until**                    Date                   Required

         **max_uses**                   Integer                  Required

        **used_count**                  Integer              Auto-incremented

        **is_active**                   Boolean                Default: true

        **created_by**           FK → User (owner only)          Required
  -------------------------- ------------------------------ -------------------

**Relationships:** *Connects to: Payment, User, ServicePlan*

**Entity: DOCUMENT**

  -------------------------- ------------------------------ -------------------
          **FIELD**                 **DESCRIPTION**              **NOTES**

       **document_id**                    UUID                      PK

         **order_id**                FK → WorkOrder              Required

       **uploaded_by**                 FK → User                 Required

      **uploader_role**       ENUM: client / staff / owner         Auto

    **document_category**    ENUM: Salary / House Property       Required
                               / Other Sources / Capital    
                               Gains / NRI / Presumptive    
                             Business / Regular Business /  
                                   Delivery / Consent       

      **document_type**      e.g., Form 16, Bank Statement,      Required
                                      ITR XML etc.          

        **file_name**              Original filename             Required

        **file_path**            Encrypted storage path          Required

       **file_size_kb**                 Integer                    Auto

   **is_delivery_document**             Boolean               Default: false

         **version**            Integer (for re-uploads)        Default: 1

       **uploaded_at**                 Timestamp                   Auto
  -------------------------- ------------------------------ -------------------

**Relationships:** *Connects to: WorkOrder, User*

**Entity: QUERY**

  ------------------ ------------------------------ -------------------
      **FIELD**             **DESCRIPTION**              **NOTES**

     **query_id**                 UUID                      PK

     **order_id**            FK → WorkOrder              Required

    **raised_by**       FK → User (staff/owner)          Required

    **query_text**                Text                   Required

      **status**     ENUM: Open / Replied / Closed     Default: Open

   **client_reply**               Text                  Conditional

    **replied_at**             Timestamp                Conditional

    **closed_at**              Timestamp                Conditional

    **created_at**             Timestamp                   Auto
  ------------------ ------------------------------ -------------------

**Relationships:** *Connects to: WorkOrder, User*

**Entity: WORK DELIVERY**

  ---------------------- ------------------------------ -------------------
        **FIELD**               **DESCRIPTION**              **NOTES**

     **delivery_id**                  UUID                      PK

       **order_id**              FK → WorkOrder              Required

     **submitted_by**          FK → User (staff)             Required

   **approval_status**     ENUM: Pending / Approved /    Default: Pending
                                    Rejected            

     **approved_by**           FK → User (owner)            Conditional

     **approved_at**               Timestamp                Conditional

   **rejection_reason**               Text                  If Rejected

    **delivery_type**      ENUM: Portal Upload / XML        Per consent
                                    Delivery            

   **final_documents**       Array of Document IDs           Required

     **submitted_at**              Timestamp                   Auto

     **delivered_at**              Timestamp                Conditional
  ---------------------- ------------------------------ -------------------

**Relationships:** *Connects to: WorkOrder, User, Document*

**Entity: FEEDBACK**

  ------------------ ------------------------------ -------------------
      **FIELD**             **DESCRIPTION**              **NOTES**

   **feedback_id**                UUID                      PK

     **order_id**            FK → WorkOrder              Required

    **client_id**              FK → User                 Required

      **rating**              Integer 1--5               Required

     **comments**           Text (optional)              Optional

   **submitted_at**            Timestamp                   Auto
  ------------------ ------------------------------ -------------------

**Relationships:** *Connects to: WorkOrder, User*

**Entity: AUDIT LOG**

  ----------------- ------------------------------ -------------------
      **FIELD**            **DESCRIPTION**              **NOTES**

     **log_id**                  UUID                      PK

    **actor_id**              FK → User                 Required

   **actor_role**   ENUM: owner / staff / client /      Required
                                system             

     **action**        e.g., DOCUMENT_UPLOADED,         Required
                           STATUS_CHANGED,         
                          DELIVERY_APPROVED        

   **entity_type**    e.g., WorkOrder, Document,        Required
                               Payment             

    **entity_id**     ID of the affected entity         Required

    **old_value**    JSON snapshot before change       Conditional

    **new_value**     JSON snapshot after change       Conditional

   **ip_address**             Client IP                   Auto

    **timestamp**             Timestamp                   Auto
  ----------------- ------------------------------ -------------------

**Relationships:** *Connects to: All entities; Read by Owner only*

**TASK 4 --- PRIMARY WORKFLOWS**

**Workflow 1: Client Self-Registration & Onboarding**

  ------------- -------------------------------------------------------
   **TRIGGER**  Client visits app and selects \'Register\'

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. Client enters name, email, mobile number, and     |
|           | sets password                                         |
|           |                                                       |
|           | 2\. System generates unique Client ID (auto)          |
|           |                                                       |
|           | 3\. Client accepts Data Privacy Policy and Storage    |
|           | Consent (mandatory gate)                              |
|           |                                                       |
|           | 4\. Email verification link sent automatically        |
|           |                                                       |
|           | 5\. Client verifies email and gains access            |
|           |                                                       |
|           | 6\. Client completes profile: PAN, Aadhaar (with      |
|           | explicit consent), bank details, address              |
|           |                                                       |
|           | 7\. Sensitive fields (PAN, Aadhaar, bank details, IT  |
|           | portal password) encrypted on save                    |
+-----------+-------------------------------------------------------+

  ------------ -------------------------------------------------------
   **DECISION  If client does not verify email within 24 hours →
    POINT**    account remains inactive; auto-reminder email sent

  ------------ -------------------------------------------------------

  ---------------- -------------------------------------------------------
   **AUTOMATION**  Auto-email: Welcome message with login instructions +
                   privacy policy summary

  ---------------- -------------------------------------------------------

  ---------- -------------------------------------------------------
    **END    Verified, profiled client account ready to place an ITR
   STATE**   work order

  ---------- -------------------------------------------------------

**Workflow 2: ITR Work Order Placement & Payment**

  ------------- -------------------------------------------------------
   **TRIGGER**  Logged-in client selects \'File My ITR\'

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. Client selects Financial Year (FY 2024-25         |
|           | onwards)                                              |
|           |                                                       |
|           | 2\. Client selects Entity Type (Individual / NRI /    |
|           | Partnership / Pvt Ltd / Public Ltd / Trust-AOP-BOI)   |
|           |                                                       |
|           | 3\. Client selects one or more Income Types           |
|           | (multi-select)                                        |
|           |                                                       |
|           | 4\. Client selects Original or Revised Return         |
|           |                                                       |
|           | 5\. System dynamically populates applicable service   |
|           | plan(s) and price (pull model --- displayed only at   |
|           | this step)                                            |
|           |                                                       |
|           | 6\. Client selects plan; optionally enters coupon     |
|           | code                                                  |
|           |                                                       |
|           | 7\. System validates coupon: checks expiry,           |
|           | per-client eligibility, usage count, plan             |
|           | applicability                                         |
|           |                                                       |
|           | 8\. Final payable amount displayed (base price minus  |
|           | discount %)                                           |
|           |                                                       |
|           | 9\. Client pays via GPay QR code; enters transaction  |
|           | reference number                                      |
|           |                                                       |
|           | 10\. Owner/staff confirms payment receipt and marks   |
|           | payment status as \'Confirmed\'                       |
|           |                                                       |
|           | 11\. Work order is created with status: \'Documents   |
|           | Pending\'                                             |
+-----------+-------------------------------------------------------+

+:----------:+-------------------------------------------------------+
| **DECISION | Invalid coupon → error message, full price applies    |
| POINT**    |                                                       |
|            | Payment not confirmed within 48 hours → auto-reminder |
|            | to client; order stays in \'Payment Pending\'         |
+------------+-------------------------------------------------------+

+:--------------:+-------------------------------------------------------+
| **AUTOMATION** | Email to client: Payment confirmation + next steps    |
|                | (document upload instructions)                        |
|                |                                                       |
|                | Email/in-app alert to staff: New work order assigned  |
+----------------+-------------------------------------------------------+

  ---------- -------------------------------------------------------
    **END    Work order created, payment confirmed, client directed
   STATE**   to document upload

  ---------- -------------------------------------------------------

**Workflow 3: Document Collection**

  ------------- -------------------------------------------------------
   **TRIGGER**  Work order status = \'Documents Pending\'; client logs
                in

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. System displays income-type-specific              |
|           | questionnaire (per Section 3 of framework)            |
|           |                                                       |
|           | 2\. Client answers questionnaire fields (number of    |
|           | employers, property types, asset sales, etc.)         |
|           |                                                       |
|           | 3\. System displays required document checklist based |
|           | on questionnaire responses                            |
|           |                                                       |
|           | 4\. Client uploads documents (PDF/image formats);     |
|           | each file tagged by category and type                 |
|           |                                                       |
|           | 5\. Client confirms \'All documents uploaded\'        |
|           |                                                       |
|           | 6\. Client provides IT portal password (encrypted on  |
|           | save; vault stored)                                   |
|           |                                                       |
|           | 7\. Client provides explicit consent: \'Authorise     |
|           | firm to upload ITR on Income Tax Portal\' (yes/no)    |
|           |                                                       |
|           | 8\. Work order status auto-updates to \'In Process\'  |
|           |                                                       |
|           | 9\. Staff receives email notification                 |
+-----------+-------------------------------------------------------+

+:----------:+-------------------------------------------------------+
| **DECISION | Consent = NO → delivery type set to \'XML Delivery\'  |
| POINT**    |                                                       |
|            | Consent = YES → delivery type set to \'Portal         |
|            | Upload\'                                              |
+------------+-------------------------------------------------------+

  ---------------- -------------------------------------------------------
   **AUTOMATION**  Email to staff: Work order ready for processing with
                   document summary

  ---------------- -------------------------------------------------------

  ---------- -------------------------------------------------------
    **END    All documents uploaded, consent recorded, order status
   STATE**   = \'In Process\'

  ---------- -------------------------------------------------------

**Workflow 4: ITR Processing & Query Management**

  ------------- -------------------------------------------------------
   **TRIGGER**  Staff receives work order with status \'In Process\'

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. Staff downloads client documents and details from |
|           | the app                                               |
|           |                                                       |
|           | 2\. Staff begins ITR preparation using external tools |
|           |                                                       |
|           | 3\. If information is insufficient, staff raises a    |
|           | structured query via the Query tab                    |
|           |                                                       |
|           | 4\. Work order status auto-updates to \'Query         |
|           | Raised\'                                              |
|           |                                                       |
|           | 5\. Client receives email notification with query     |
|           | details                                               |
|           |                                                       |
|           | 6\. Client replies to query within the app            |
|           |                                                       |
|           | 7\. Work order status auto-updates to \'Query         |
|           | Replied\'                                             |
|           |                                                       |
|           | 8\. Staff receives email notification of client reply |
|           |                                                       |
|           | 9\. Steps 3-8 repeat as needed (multiple query        |
|           | rounds)                                               |
|           |                                                       |
|           | 10\. Staff uploads final ITR, computation of income,  |
|           | and any notes as delivery documents                   |
|           |                                                       |
|           | 11\. Staff submits work for Owner approval            |
+-----------+-------------------------------------------------------+

+:----------:+-------------------------------------------------------+
| **DECISION | Staff can raise multiple queries before submission    |
| POINT**    |                                                       |
|            | All queries must be in \'Closed\' or \'Replied\'      |
|            | status before delivery submission is permitted        |
+------------+-------------------------------------------------------+

+:--------------:+-------------------------------------------------------+
| **AUTOMATION** | Email to client on query raised                       |
|                |                                                       |
|                | Email to staff on client query reply                  |
+----------------+-------------------------------------------------------+

  ---------- -------------------------------------------------------
    **END    Delivery documents uploaded; order status = \'Pending
   STATE**   Approval\'

  ---------- -------------------------------------------------------

**Workflow 5: Owner Approval & Work Delivery**

  ------------- -------------------------------------------------------
   **TRIGGER**  Work order status = \'Pending Approval\'; owner
                receives notification

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. Owner reviews delivery documents (ITR,            |
|           | computation, notes) in the app                        |
|           |                                                       |
|           | 2\. Decision A --- Approve: Status updates to         |
|           | \'Approved for Delivery\'                             |
|           |                                                       |
|           | 3\. Based on consent flag:                            |
|           |                                                       |
|           | • Portal Upload consent = YES: Staff manually uploads |
|           | ITR to Income Tax Portal using client credentials     |
|           | from vault; then uploads acknowledgement to app       |
|           |                                                       |
|           | • Portal Upload consent = NO: System packages         |
|           | XML/JSON + computation for delivery                   |
|           |                                                       |
|           | 4\. Final documents delivered to client via app       |
|           |                                                       |
|           | 5\. Work order status updates to \'ITR Filed\'        |
|           |                                                       |
|           | 6\. Client receives email: \'Your ITR has been filed  |
|           | / documents are ready\'                               |
|           |                                                       |
|           | 7\. Decision B --- Reject: Owner adds rejection       |
|           | reason; status reverts to \'In Process\'; staff       |
|           | notified via email                                    |
+-----------+-------------------------------------------------------+

+:----------:+-------------------------------------------------------+
| **DECISION | Owner approval is a mandatory gate --- no delivery    |
| POINT**    | can bypass this step                                  |
|            |                                                       |
|            | IT portal upload is a manual staff action --- no      |
|            | automation                                            |
+------------+-------------------------------------------------------+

+:--------------:+-------------------------------------------------------+
| **AUTOMATION** | Email to client: Delivery notification with download  |
|                | link                                                  |
|                |                                                       |
|                | Email to staff: Approval or rejection notification    |
+----------------+-------------------------------------------------------+

  ---------- -------------------------------------------------------
    **END    Documents delivered to client; status = \'ITR Filed\'
   STATE**   

  ---------- -------------------------------------------------------

**Workflow 6: Post-Filing Status Updates**

  ------------- -------------------------------------------------------
   **TRIGGER**  Owner or staff learns of e-Return processing update or
                Intimation from Income Tax Department

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. Owner or staff manually updates status in app to  |
|           | \'e-Return Processing\' or \'Intimation Received\'    |
|           |                                                       |
|           | 2\. Staff/owner adds relevant notes or uploads        |
|           | intimation document if available                      |
|           |                                                       |
|           | 3\. System sends email to client notifying of status  |
|           | change                                                |
+-----------+-------------------------------------------------------+

  ---------------- -------------------------------------------------------
   **AUTOMATION**  Email to client on every status change to \'e-Return
                   Processing\' or \'Intimation Received\'

  ---------------- -------------------------------------------------------

  ---------- -------------------------------------------------------
    **END    Client is informed; status = \'Completed\' when all
   STATE**   post-filing actions are done

  ---------- -------------------------------------------------------

**Workflow 7: Refund Processing**

  ------------- -------------------------------------------------------
   **TRIGGER**  Client raises dispute or firm acknowledges non-delivery

  ------------- -------------------------------------------------------

+:---------:+-------------------------------------------------------+
| **STEPS** | 1\. Dispute/non-delivery claim raised (by client or   |
|           | owner)                                                |
|           |                                                       |
|           | 2\. Owner reviews the claim                           |
|           |                                                       |
|           | 3\. If valid: owner initiates refund of 50% of fees   |
|           | paid                                                  |
|           |                                                       |
|           | 4\. Refund processed manually via GPay or bank        |
|           | transfer                                              |
|           |                                                       |
|           | 5\. Payment record updated: refund_amount_inr = 50%   |
|           | of amount_inr; status = \'Refunded\'                  |
|           |                                                       |
|           | 6\. Audit log entry created                           |
|           |                                                       |
|           | 7\. Client notified via email                         |
+-----------+-------------------------------------------------------+

+:----------:+-------------------------------------------------------+
| **DECISION | Refund eligibility subject to terms & conditions ---  |
| POINT**    | owner makes final determination                       |
|            |                                                       |
|            | 50% refund is the fixed rule; no full refunds         |
+------------+-------------------------------------------------------+

  ---------------- -------------------------------------------------------
   **AUTOMATION**  Email to client: Refund confirmation with amount and
                   reference

  ---------------- -------------------------------------------------------

  ---------- -------------------------------------------------------
    **END    Partial refund processed; order marked as
   STATE**   \'Disputed/Closed\'

  ---------- -------------------------------------------------------

**TASK 5 --- BUSINESS RULES**

**5.1 Validation Rules**

  ------------------- -------------------------- -------------------
       **FIELD**         **VALIDATION RULE**      **ERROR MESSAGE**

    **PAN Number**       Format: 5 alpha + 4     Invalid PAN format.
                       numeric + 1 alpha (e.g.,      Must be 10
                      ABCDE1234F); Mandatory for     characters.
                                 all             

  **Aadhaar Number**   12-digit numeric; stored    Invalid Aadhaar
                       only if consent = TRUE;     number. Consent
                           Luhn validation       required to store.
                             recommended         

   **Mobile Number**  Exactly 10 digits; numeric Mobile number must
                         only; Indian format        be 10 digits.

   **Email Address**  RFC 5322 compliant; unique     Invalid or
                              in system            duplicate email
                                                      address.

      **IT Portal      Min 8 characters; stored  Password must be at
      Password**          only after AES-256     least 8 characters.
                          encryption; never      
                         displayed post-save     

     **IFSC Code**     Format: 4 alpha + 0 + 6    Invalid IFSC code
                         alphanumeric (e.g.,           format.
                             SBIN0001234)        

  **GPay Transaction     Alphanumeric, min 8         Transaction
         Ref**        characters; mandatory for     reference is
                         payment confirmation         required.

    **Coupon Code**     Must exist in Discount    Invalid, expired,
                        table; valid_until \>=     or already used
                         today; used_count \<       coupon code.
                       max_uses; applicable to   
                      selected plan; per-client  
                        eligibility must match   

  **Financial Year**   Must be from predefined    Invalid financial
                         ENUM list; cannot be      year selection.
                      future FY beyond current+1 

  **Document Upload**  Max file size: 10 MB per   File too large or
                       file; Accepted formats:   unsupported format.
                         PDF, JPG, PNG, JPEG     

      **Rating**       Integer between 1 and 5     Rating must be
                             (inclusive)          between 1 and 5.

      **Discount       Decimal between 0.01 and   Discount must be
     Percentage**               100.00             between 0% and
                                                        100%.
  ------------------- -------------------------- -------------------

**5.2 Business Logic Rules**

- Service plan is dynamically populated based on selected income types
  --- client cannot manually select a plan that does not cover their
  income types

- Payment must be confirmed by owner/staff before work order proceeds to
  \'Documents Pending\' --- system cannot auto-confirm GPay payments

- A work order cannot move to \'Pending Approval\' if any query has
  status \'Open\' (unanswered queries must be resolved first)

- Owner approval is mandatory before any delivery reaches the client ---
  this step cannot be bypassed by any role

- IT portal upload is a manual staff action using credentials from the
  secure vault --- no automated portal integration

- Pricing is shown to clients only when they reach the service plan
  selection step (pull model) --- not on the home/dashboard screens

- If IT portal upload consent = NO, delivery type is automatically set
  to XML/JSON; the portal password vault entry is not used

- e-Return and Intimation status must be manually entered by owner or
  staff --- not auto-synced with IT portal

- Owner\'s name, personal details, and identity must not appear anywhere
  in the client-facing UI

- Staff logins are via individual Google accounts --- no shared staff
  credentials permitted

**5.3 Approval Chains**

  ---------------------- ---------------- ---------------- --------------
    **ACTION REQUIRING   **SUBMITTED BY** **APPROVED BY**     **BYPASS
        APPROVAL**                                           ALLOWED?**

    **Work delivery to        Staff        Owner / Admin      **No ---
         client**                                           mandatory**

  **Refund processing**  Client (dispute)  Owner / Admin       **No**
                             or Staff                      

        **Payment          Client (GPay    Owner or Staff     **No ---
      confirmation**         payment)                          manual
                                                            confirmation
                                                             required**

    **Discount coupon          ---           Owner only       **N/A**
        creation**                           (creates)     

     **Client account          ---           Owner only       **N/A**
        deletion**                                         
  ---------------------- ---------------- ---------------- --------------

**5.4 Pricing & Calculation Rules**

  -------------------------------- --------------------------------
          **SERVICE PLAN**               **BASE PRICE (INR)**

  **Simple Return (Salary + House            **₹ 1,500**
    Property + Other Sources)**    

  **Simple Return + Capital Gain**           **₹ 4,000**

  **Simple Return + Capital Gain +           **₹ 7,000**
               NRI**               

  **Simple Return + Capital Gain +           **₹ 4,500**
       Presumptive Business**      

      **Capital Gain + Regular               **₹ 10,000**
         Business Income**         
  -------------------------------- --------------------------------

**Calculation Formula: Final Payable Amount = Base Price − (Base Price ×
Discount % / 100)**

Refund Formula: Refund Amount = Amount Paid × 50% (subject to T&C and
Owner approval)

**5.5 Security & Compliance Rules**

- All sensitive fields (PAN, Aadhaar, bank details, IT portal password)
  must be encrypted using AES-256 before database storage

- IT portal password must be stored in a secure vault (separate
  encryption key); never displayed in the UI after initial save

- Aadhaar may only be stored after explicit, timestamped client consent;
  purpose limited to ITR filing only

- Data privacy policy must be accepted by all users at registration;
  policy version tracked per user

- Audit log must record all data access, modifications, uploads, status
  changes, approvals, and deletions

- HTTPS/TLS mandatory for all data in transit

- Staff and Owner passwords must meet minimum complexity: 8+ characters

- Session tokens must expire after reasonable inactivity period
  (recommended: 30 minutes for staff/owner)

**TASK 6 --- SUCCESS METRICS**

**6.1 User Success Metrics**

  ---------------- ---------------------- ---------------------------
     **METRIC**       **CURRENT STATE      **TARGET (POST-LAUNCH)**
                        (BASELINE)**      

      **Client           Multi-day        **\< 30 minutes per order**
      document        (WhatsApp/email     
     submission       back-and-forth)     
       time**                             

   **Client query   Untracked; hours to     **\< 24 hours (tracked
  response time**           days                   in-app)**

  **Client status         Requires        **100% self-serve via app**
       check       calling/messaging the  
   (self-serve)**           firm          

  **Staff document  Manual search across  **\< 5 minutes per order**
  retrieval time**        channels        

  **Error rate in   High (undocumented)      **\< 10% orders with
      missing                                 missing doc flag**
    documents**                           

      **Client           Untracked         **Average rating ≥ 4.0 /
    satisfaction                                     5.0**
      score**                             
  ---------------- ---------------------- ---------------------------

**6.2 Business Impact Metrics**

  ------------------- ---------------------- ---------------------------
      **METRIC**        **CURRENT STATE**            **TARGET**

     **ITR orders       Limited by manual    **25--40% increase without
      handled per            capacity            additional staff**
       season**                              

  **Revenue per staff       Untracked             **Measurable via
       member**                                      dashboard**

       **Payment        Post-work (ad hoc     **100% upfront, same-day
   collection time**        invoicing)             confirmation**

  **Refund disputes**  Ad hoc, undocumented    **100% documented with
                                                    audit trail**

  **Client retention        Untracked          **Trackable from Year 2
   (repeat orders)**                                  onwards**

   **Coupon/discount       Not offered          **Trackable usage per
    effectiveness**                                  campaign**
  ------------------- ---------------------- ---------------------------

**6.3 Operational Efficiency Metrics**

  ----------------------- ---------------------- ---------------------------
        **METRIC**          **CURRENT STATE**            **TARGET**

      **Hours/week on     Significant; untracked    **Reduced by ≥ 70%**
   WhatsApp follow-ups**                         

    **Document version           Frequent          **Zero (version control
   confusion incidents**                                  in-app)**

          **Staff             Manual; ad hoc     **Fully automated via email
   reminder/coordination                                 triggers**
          time**                                 

    **Audit/compliance        No audit trail     **100% audit log coverage**
        readiness**                              

  **Owner oversight time   Manual review across   **Dashboard-driven; \< 5
        per order**              channels                min/order**

    **IT portal upload    Possible (credentials    **Minimised via secure
         errors**               misplaced)             vault access**
  ----------------------- ---------------------- ---------------------------

**6.4 Phase 2 --- Future Scope (Noted for Planning)**

+-----------------------------------------------------------------+
| **PHASE 2 FEATURES (Nice to Have --- Future Version)**          |
|                                                                 |
| Per the framework, the following enhancements are deferred: •   |
| Automation reminders for Advance Tax due dates (March 15, June  |
| 15, September 15, December 15) • Tax payment reminders for      |
| self-assessment tax before ITR filing deadline • GST filing     |
| module (implied logical extension) • Automated ITR status       |
| polling (if IT portal API becomes available) • Multi-firm or    |
| multi-branch support                                            |
+-----------------------------------------------------------------+

*Document End --- Product Specification v1.0 \| Geetanjali Jojare &
Associates \| Confidential*
