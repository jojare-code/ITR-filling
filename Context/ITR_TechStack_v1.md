◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

**TECH STACK RECOMMENDATION**

***& Design Brief***

ITR Filing Management Platform --- Geetanjali Jojare & Associates

◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

  -------------------- ---------------------------------
     **Document Type** Tech Stack & Design Brief ---
                       Stage 2 Input

           **Version** v1.0 --- April 2026

          **Based On** Product Specification v1.0

    **Classification** Confidential --- Client Use Only
  -------------------- ---------------------------------

**STEP 1 --- WORKLOAD ANALYSIS**

**1.1 Primary Value Proposition**

+-----------------------------------------------------------------+
| **Core Workload Classification**                                |
|                                                                 |
| This application is primarily a UI/COORDINATION hybrid:         |
|                                                                 |
| • 70% UI/Interface --- clients interact with multi-step forms,  |
| document uploads, status dashboards                             |
|                                                                 |
| • 20% Coordination --- routing work orders between client →     |
| staff → owner, triggering email notifications                   |
|                                                                 |
| • 10% Data presentation --- owner dashboard showing pipeline    |
| status, payment totals, work progress                           |
|                                                                 |
| It is NOT a data-processing app (no ML, no heavy calculations). |
| It is NOT real-time (no live chat, no WebSocket needed).        |
|                                                                 |
| All financial calculation is simple arithmetic (base price ×    |
| discount %). No complex computation engine required.            |
+-----------------------------------------------------------------+

**1.2 User Types & Usage Patterns**

  --------------- ----------------- ----------------- --------------------
   **USER TYPE**   **ACCESS TYPE**      **PRIMARY     **USAGE FREQUENCY**
                                        DEVICE**      

     **Client      Public internet    Mobile phone     Seasonal --- heavy
      (public     --- SEO partially    (primary);     during Jan--Jul ITR
     users)**         relevant      Desktop secondary        season
                   (login/register                    
                       pages)                         

    **Staff (2      Authenticated    Desktop/Laptop     Daily during ITR
     users)**     only --- internal (document work);         season
                  productivity tool Mobile secondary  

   **Owner/Admin  Authenticated --- Mobile + Desktop   Daily monitoring;
    (1 user)**       dashboard &         equally       approval-on-demand
                      approval                        
  --------------- ----------------- ----------------- --------------------

**1.3 Top 5 Critical Operations**

  ---------------- ---------------- ---------------- -----------------
   **OPERATION**       **TYPE**      **FREQUENCY**    **CRITICALITY**

      **Client     CRUD + File I/O   High --- every      **Mission
  document upload                      work order       critical**
   (PDF/image)**                                     

    **Work order        CRUD +          High ---         **Mission
       status        Coordination    multiple times     critical**
   transitions**                       per order     

      **Email      Coordination ---    Medium ---        **High**
    notification    trigger-based   \~5--8 per work  
     dispatch**                          order       

  **Staff query ↔       CRUD +           Medium          **High**
    client reply     Coordination                    
      thread**                                       

  **Owner approval      CRUD +        Low--Medium        **Mission
      of work        Coordination                       critical**
     delivery**         (gate)                       
  ---------------- ---------------- ---------------- -----------------

**1.4 Data Characteristics**

  --------------------- -------------------------------------------
      **DIMENSION**                   **ASSESSMENT**

     **Schema type**    Strongly relational --- Users → WorkOrders
                         → Documents → Queries → Deliveries. Clear
                         FK chains. ACID transactions required for
                                payment and status updates.

    **Read vs Write**    Moderate read + moderate write. No heavy
                         analytics. Reporting is simple counts and
                                   status aggregations.

       **Real-time      NOT required. Status updates are pull-based
      requirement**       (client refreshes) or email-pushed. No
                          WebSocket or live subscription needed.

    **File storage**    Significant. Each work order may have 5--20
                             uploaded documents (Form 16, bank
                         statements, audit reports, delivery ITR,
                          computation PDFs). Average 1--5 MB per
                                           file.

   **Sensitive data**      PAN, Aadhaar, bank details, IT portal
                         passwords --- must be encrypted at rest.
                                  Aadhaar: consent-gated.

  **Geographic scope**    Single region --- India only. No CDN or
                        multi-region database needed at MSME scale.
  --------------------- -------------------------------------------

**1.5 Scale Requirements**

  ----------------------- ---------------------- ----------------------
        **METRIC**             **ESTIMATE**            **BASIS**

    **Total registered     **50--200 (Year 1);    Typical MSME CA firm
         clients**           \~500 (Year 3)**         client base

   **Concurrent users**    **Peak: 10--20 (ITR   ITR deadline rush ---
                            season); Off-peak:         July, Dec
                                  2--5**         

   **Work orders/year**   **150--400 (Year 1)**    \~2--4 orders per
                                                   registered client

   **API requests/day**   **500--1,500 (season);   5--10 actions per
                          50--100 (off-season)**    active user/day

        **Document         **3--10 GB (Year 1);  10--20 docs × 1--3 MB
      storage/year**       15--30 GB (Year 3)**       × 300 orders

          **Email             **1,000--3,000      \~8 emails per work
   notifications/month**        (season)**               order
  ----------------------- ---------------------- ----------------------

+-----------------------------------------------------------------+
| **Key Scale Conclusion**                                        |
|                                                                 |
| This is a LOW-TRAFFIC, HIGH-VALUE-PER-SESSION application. The  |
| CA firm has 2 staff members, 1 owner, and a                     |
|                                                                 |
| few hundred clients. It is NOT a marketplace or SaaS product.   |
| MSME-appropriate tooling --- no Kubernetes,                     |
|                                                                 |
| no microservices, no event queues. A single well-structured     |
| monolith will serve this perfectly for 3--5 years.              |
+-----------------------------------------------------------------+

**STEP 2 --- TECHNOLOGY EVALUATION**

**A. Language & Runtime**

Based on primary operations (CRUD + file I/O + email coordination +
form-heavy UI), the choice is:

  ---------------- ---------------------------------------- -------------
     **OPTION**                 **REASONING**                **VERDICT**

      **Python        Django\'s ORM maps directly to the    **✅ CHOSEN**
     (Django)**    relational data model (10 entities with  
                       FK chains). Built-in admin panel     
                         accelerates owner dashboard.       
                   Batteries-included auth, file handling,  
                     email dispatch. Excellent libraries:   
                        django-storages (Supabase/S3),      
                   cryptography (AES-256 for PAN/Aadhaar).  
                     DRF (Django REST Framework) cleanly    
                     separates API for mobile-responsive    
                   React frontend. India-specific libraries 
                      (razorpay-python, etc.) available.    
                    Team-size agnostic --- 1 developer can  
                           build and maintain this.         

    **Node.js /          Would work for CRUD, but no          **❌ Not
     Express**      batteries-included ORM or admin panel.    chosen**
                       More boilerplate for auth, file      
                   handling, encryption. JavaScript fatigue 
                       risk for solo/small dev team. No     
                     compelling advantage over Django for   
                                this workload.              

     **Next.js       Tempting for mobile-first + SSR, but     **❌ Not
   (full-stack)**   mixing API routes into Next.js creates    chosen**
                        tight coupling and complicates      
                   background tasks, encryption vault, and  
                   file processing. Better to keep backend  
                         concerns strictly separated.       
  ---------------- ---------------------------------------- -------------

**B. Frontend Approach**

SEO requirement: Partially --- login/register pages should be crawlable;
dashboard pages are behind auth (SEO irrelevant).

UI complexity: High --- multi-step work order wizard, dynamic
questionnaires per income type, document upload with category tagging,
status dashboards, query threads. Server templates (Django templates)
would produce poor UX on mobile. A component framework is justified.

  ------------ ---------------------------------------- -------------
   **OPTION**               **REASONING**                **VERDICT**

    **React        Ideal for mobile-first PWA. Rich     **✅ CHOSEN**
  (Vite SPA)**   ecosystem for file upload UIs (React   
                 Dropzone), multi-step wizards (React   
               Hook Form), status dashboards. TanStack  
                Query handles server state (work order  
                 status polling) without WebSockets.    
               Tailwind CSS produces responsive layouts 
                efficiently. Deployment to Cloudflare   
                 Pages (unlimited free bandwidth) ---   
                    separate from Django backend.       

   **Next.js    Only advantage is SSR for public pages    **❌ Not
     (React      --- but this app has minimal public      chosen**
     SSR)**       content (login/register only). SSR    
               overhead is unjustified. Adds deployment 
                complexity (Vercel vs Railway backend   
                               split).                  

    **Vue /       Viable alternative, but React has       **❌ Not
     Nuxt**      stronger ecosystem for this type of      chosen**
               form-heavy workflow app. No significant  
                     advantage for this use case.       
  ------------ ---------------------------------------- -------------

**C. Backend Architecture**

Frontend is React SPA → backend must be a REST API. Django REST
Framework (DRF) is the natural pairing with Django.

+-----------------------------------------------------------------+
| **Architecture Decision: Monolith (Not Microservices)**         |
|                                                                 |
| A monolith is correct for this application. Reasons:            |
|                                                                 |
| • 1 owner, 2 staff, \~200 clients --- no scale justification    |
| for service decomposition                                       |
|                                                                 |
| • All operations (auth, file handling, notifications, status    |
| updates) share the same database                                |
|                                                                 |
| • Single deployment unit is simpler to maintain, debug, and     |
| iterate                                                         |
|                                                                 |
| • Django monolith with DRF API endpoints: /api/auth/,           |
| /api/orders/, /api/documents/, /api/queries/, /api/payments/    |
+-----------------------------------------------------------------+

**D. Database Selection**

Data model: 10 entities with clear FK relationships, financial
transactions requiring ACID, structured queries across WorkOrder status.
PostgreSQL is unambiguously correct.

  ---------------- ------------------------------------ ---------------
     **OPTION**               **REASONING**               **VERDICT**

    **PostgreSQL     Perfectly fits relational model.    **✅ CHOSEN**
    (Supabase)**   Supabase free tier: 500MB storage, 2 
                    project limit, 50MB file storage.   
                   Supabase Auth can be used for client 
                      registration (email+password).    
                      Row-level security available.     
                    Supabase Storage handles document   
                      uploads (expands to 1GB free).    
                   Single integrated platform for DB +  
                    Auth + Storage --- reduces moving   
                   parts significantly. Python client:  
                               supabase-py.             

     **Firebase    NoSQL is wrong for this data model.  **❌ Wrong data
    Firestore**    JOINs across WorkOrder → Document →    model fit**
                      Query → Delivery would require    
                        multiple round-trips. ACID      
                        transactions are harder to      
                         implement. Not suitable.       

       **Neon        3GB free tier vs Supabase 500MB.      **❌ More
   (PostgreSQL)**  Better for DB-only. BUT Neon has no  moving parts**
                   integrated auth or storage --- would 
                        require separate services.      
                   Supabase\'s integrated stack reduces 
                        complexity at this scale.       
  ---------------- ------------------------------------ ---------------

**E. Authentication Strategy**

Requirements: Email+password for clients and owner; Google OAuth for 2
staff members (specified in framework). Aadhaar-linked account possible
future.

+-----------------------------------------------------------------+
| **Authentication: Supabase Auth (BaaS)**                        |
|                                                                 |
| Supabase Auth supports: Email+password (clients, owner), Google |
| OAuth (staff --- as specified in framework).                    |
|                                                                 |
| Free tier: Unlimited users. Email verification built-in. JWT    |
| tokens for DRF backend validation.                              |
|                                                                 |
| Django backend validates Supabase JWT on every API request      |
| using supabase-py or PyJWT.                                     |
|                                                                 |
| Alternative considered: Django built-in auth --- rejected       |
| because staff requires Google OAuth which needs additional      |
| setup,                                                          |
|                                                                 |
| and Supabase Auth is already in the stack for database.         |
+-----------------------------------------------------------------+

**F. File Storage**

File type: PDFs, JPG/PNG scans of documents. Delivery files: PDF (ITR
form, computation). No images/video. Storage estimate: 3--10 GB Year 1.

  ---------------- ------------------------------------ ---------------
     **OPTION**               **REASONING**               **VERDICT**

     **Supabase     1GB free storage. Integrated with     **✅ CHOSEN
      Storage      Supabase DB --- file paths stored as     (Y1)**
    (primary)**       references in Document table.     
                   Bucket-level access policies (client 
                     can only access own documents).    
                      Python upload via supabase-py.    
                   Sufficient for \~200 work orders in  
                   Year 1 (avg 3--5 MB per order = \~1  
                   GB). Upgrade to Pro (\$25/mo) at 1GB 
                                threshold.              

   **Backblaze B2    10GB free, S3-compatible. Use as    **✅ Planned
    (overflow)**      secondary bucket when Supabase       overflow
                        storage approaches limit.           (Y2+)**
                       django-storages supports B2.     
                        Cost-effective scale path:      
                      \$0.006/GB/month beyond free.     

   **Cloudinary**  Designed for image optimization ---  **❌ Wrong use
                   overkill for PDFs and tax documents.     case**
                      No transformation needs. Adds     
                         unnecessary complexity.        
  ---------------- ------------------------------------ ---------------

**G. Hosting Strategy**

  ---------------- -------------------- -------------------- -----------------
   **COMPONENT**       **SERVICE**          **FREE TIER        **RATIONALE**
                                             DETAILS**       

      **React      **Cloudflare Pages** Unlimited bandwidth,    Zero cost,
     Frontend**                          500 builds/month,    fastest CDN for
                                             global CDN       India, no cold
                                                                  starts

  **Django Backend    **Render.com**      750 hours/month    Best Python free
      (DRF)**                             free. Auto-sleep   tier. Auto-deploy
                                            after 15 min       from GitHub.
                                         (mitigated below).  
                                         Includes Postgres   
                                              add-on.        

   **PostgreSQL**      **Supabase**        500MB DB, 1GB        Integrated
                                         storage, 50k auth    DB+Auth+Storage
                                            users/month          platform

    **Background   **Render Cron Jobs**  Free for scheduled  Email reminders,
      tasks**                                   jobs           status checks
  ---------------- -------------------- -------------------- -----------------

+-----------------------------------------------------------------+
| **Cold Start Mitigation (Render Free Tier)**                    |
|                                                                 |
| Render free tier sleeps after 15 min inactivity --- 30--50      |
| second cold start. Mitigation strategy:                         |
|                                                                 |
| • Use UptimeRobot (free) to ping the backend every 14 minutes   |
| during business hours (8 AM -- 10 PM IST)                       |
|                                                                 |
| • This keeps the server warm for all active sessions at zero    |
| cost                                                            |
|                                                                 |
| • Off-season / midnight hours: cold start is acceptable --- no  |
| active users                                                    |
+-----------------------------------------------------------------+

**H. Integrations & External Services**

  ----------------- ----------------- -------------- ----------------- ------------
     **PURPOSE**      **PROVIDER**       **SDK**       **FREE TIER**     **SETUP
                                                                          TIME**

       **Email       **Resend.com**     Python SDK         3,000       Same day ---
   notifications**                       (resend)      emails/month;      no KYC
                                                          100/day      

   **Payment (GPay   **GPay QR Code   No SDK needed     Free --- no     Immediate
        QR)**          (static)**     --- static QR   per-transaction  
                                      image + manual       fees        
                                       confirmation                    

   **Google OAuth    **Google Cloud    supabase-py       Free ---       1--2 hours
      (Staff)**         Console**       (built-in)       unlimited        setup

       **Email       **Supabase Auth   supabase-py   Included in free   Immediate
   verification**     (built-in)**                         tier        

      **Uptime       **UptimeRobot**  No SDK --- web 50 monitors free    Same day
    monitoring**                        dashboard                      
  ----------------- ----------------- -------------- ----------------- ------------

+-----------------------------------------------------------------+
| **Payment Note --- GPay QR (Static)**                           |
|                                                                 |
| Framework specifies GPay QR code payment. This is implemented   |
| as a STATIC QR code displayed to the client                     |
|                                                                 |
| after plan selection. Client pays and enters the transaction    |
| reference number manually. Staff/owner confirms                 |
|                                                                 |
| payment in the app. This requires NO payment gateway, NO KYC,   |
| NO per-transaction fees --- ideal for MSME.                     |
|                                                                 |
| Future upgrade path: Razorpay (Python SDK, 2-3 day KYC) if      |
| automated payment confirmation is needed later.                 |
+-----------------------------------------------------------------+

**STEP 3 --- FINAL TECH STACK RECOMMENDATION**

  -------------------- ------------------- ------------------- ---------------
       **LAYER**         **TECHNOLOGY**    **SERVICE / HOST**   **FREE TIER**

      **Frontend**     **React 18 + Vite +  Cloudflare Pages    Unlimited BW,
                         Tailwind CSS**                         500 builds/mo

  **State Management**  **TanStack Query      Bundled with       Free / OSS
                              v5**              frontend       

       **Forms**       **React Hook Form +       Bundled         Free / OSS
                        Zod validation**                       

      **Backend**      **Django 5 + Django  Render.com (free    750 hrs/month
                        REST Framework**          tier)        

     **Task Queue**       **Django-Q2 /     Render Cron Jobs        Free
                          Render Cron**                        

      **Database**      **PostgreSQL 15**    Supabase (free    500 MB database
                                                  tier)        

   **Authentication**   **Supabase Auth**    Supabase (free    50,000 MAU free
                                                  tier)        

    **File Storage**   **Supabase Storage      Supabase →       1 GB → 10 GB
                        → Backblaze B2**        Backblaze           free

       **Email**         **Resend.com**        Resend API        3,000/month
                                                                    free

     **Encryption**         **Python       In-process (Django)   Free / OSS
                          cryptography                         
                         (AES-256-GCM)**                       

       **Uptime**        **UptimeRobot**       UptimeRobot       50 monitors
                                                                    free

      **GPay QR**      **Static QR image + No external service      Free
                        manual confirm**                       
  -------------------- ------------------- ------------------- ---------------

**Architecture Diagram**

+------------------------------------------------------------------+
| **Data Flow --- ITR Filing Management Platform**                 |
|                                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
|                                                                  |
| │ CLIENT (Mobile Browser / Desktop Browser) │                    |
|                                                                  |
| │ React 18 SPA (Vite) + Tailwind CSS │                           |
|                                                                  |
| │ Hosted: Cloudflare Pages (CDN --- India Edge Node) │           |
|                                                                  |
| └─────────────────────┬────────────────────────────────────────┘ |
|                                                                  |
| │ HTTPS REST API calls (/api/\*)                                 |
|                                                                  |
| ▼                                                                |
|                                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
|                                                                  |
| │ DJANGO 5 + DRF (REST API Backend) │                            |
|                                                                  |
| │ Hosted: Render.com (Python service, 750 hrs/month free) │      |
|                                                                  |
| │ Modules: Auth validator, WorkOrder API, Document API, │        |
|                                                                  |
| │ Query API, Payment API, Delivery API, │                        |
|                                                                  |
| │ Notification dispatcher, AES-256 vault │                       |
|                                                                  |
| └───────┬────────────────┬──────────────────┬──────────────────┘ |
|                                                                  |
| │ │ │                                                            |
|                                                                  |
| ▼ ▼ ▼                                                            |
|                                                                  |
| ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐   |
|                                                                  |
| │ SUPABASE │ │ SUPABASE │ │ RESEND.COM │                         |
|                                                                  |
| │ PostgreSQL │ │ Storage │ │ Transactional Email │               |
|                                                                  |
| │ (500 MB DB) │ │ (1 GB docs) │ │ 3,000 emails/month free │      |
|                                                                  |
| │ + Auth JWT │ │ → Backblaze │ │ │                               |
|                                                                  |
| └──────────────┘ └──────────────┘ └──────────────────────────┘   |
|                                                                  |
| │                                                                |
|                                                                  |
| ▼                                                                |
|                                                                  |
| ┌──────────────────────────────────────────────────────────────┐ |
|                                                                  |
| │ SUPABASE AUTH │                                                |
|                                                                  |
| │ Email+Password (clients, owner) + Google OAuth (2 staff) │     |
|                                                                  |
| │ JWT tokens validated by Django backend middleware │            |
|                                                                  |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+

**FREE TIER CAPACITY ANALYSIS**

  ----------------- -------------- ---------------- --------------------
     **SERVICE**    **FREE LIMIT** **Y1 ESTIMATE**       **STATUS**

      **Render      750 hrs/month  \~600 hrs/month   **✅ Within limit
      Backend**                         (with         (with keep-alive
                                     UptimeRobot        strategy)**
                                      keep-alive    
                                    8AM--10PM IST)  

     **Supabase         500 MB     \~30--80 MB (10    **✅ Well within
    PostgreSQL**                    entities × 400  limit for 3+ years**
                                       orders ×     
                                      metadata)     

  **Supabase Auth**   50,000 MAU    200--500 users  **✅ No concern for
                                                        MSME scale**

     **Supabase          1 GB      \~1 GB at \~300    **⚠️ Approaches
      Storage**                    work orders (avg   limit by Y1 end.
                                      3 MB each)        Overflow to
                                                      Backblaze B2.**

    **Cloudflare     Unlimited BW  N/A (static SPA     **✅ No limit
       Pages**                       --- minimal       concern ever**
                                      bandwidth)    

  **Resend Email**   3,000/month;    Peak season:    **✅ Within limit;
                       100/day      \~2,000/month;  monitor during July
                                   avg \~500/month  ITR deadline rush**

  **Backblaze B2**      10 GB          0 in Y1          **✅ Buffer
                                    (overflow from      available**
                                   Supabase Storage 
                                       in Y2+)      

   **UptimeRobot**   50 monitors   1 monitor needed     **✅ Ample**

  **Google OAuth**    Unlimited     2 staff users    **✅ No concern**
  ----------------- -------------- ---------------- --------------------

+-----------------------------------------------------------------+
| **When to Upgrade to Paid Tier**                                |
|                                                                 |
| Trigger: Work orders exceed \~350--400/year (storage \~1 GB).   |
| Action: Activate Backblaze B2 overflow --- estimated \$0 to     |
| \$1/month at 2 GB.                                              |
|                                                                 |
| Trigger: Render cold starts become unacceptable during peak     |
| season. Action: Render Starter plan --- \$7/month (always-on,   |
| no sleep).                                                      |
|                                                                 |
| Trigger: Email volume exceeds 3,000/month (heavy client base    |
| growth). Action: Resend Pro --- \$20/month for 50,000 emails.   |
|                                                                 |
| Trigger: Team grows beyond 2 staff (more Google OAuth users     |
| needed). Action: No change needed --- Google OAuth is unlimited |
| free.                                                           |
|                                                                 |
| Summary: The app can run at ZERO COST for Year 1. First paid    |
| upgrade (Render Starter) likely at Y2 if client base grows.     |
+-----------------------------------------------------------------+

**TRADEOFFS & ALTERNATIVES**

  ------------------- ------------------------ ------------------------
     **ALTERNATIVE         **WHY IT SEEMS      **WHY IT WAS REJECTED**
     CONSIDERED**           ATTRACTIVE**       

      **Firebase       Single platform, great    NoSQL is wrong data
  (Firestore + Auth +  mobile SDKs, generous   model. ACID transactions
      Storage)**      free tier, Google OAuth   for payment and status
                              built-in           updates are harder.
                                                  Complex relational
                                               queries (all work orders
                                               for staff with status X)
                                                   require multiple
                                                   round-trips. Not
                                                    suitable for a
                                               relational-first domain
                                                   like ITR filing
                                                     management.

       **Next.js      SSR + API routes in one    No SEO advantage for
     full-stack**       deployment. Popular    this app (everything is
                              choice.             behind login). API
                                                 routes and frontend
                                                  sharing deployment
                                                  creates coupling.
                                               Background tasks (email
                                                    dispatch, file
                                               processing) are harder.
                                               Django monolith is more
                                                 appropriate for this
                                                  domain complexity.

     **Supabase as     Skip Django entirely.   Cannot implement AES-256
    backend (direct       Frontend queries         encryption vault
   client access)**   Supabase DB directly via  securely client-side.
                            supabase-js.       Business logic (approval
                                                 gates, refund rules,
                                                 discount validation)
                                               must not run in browser.
                                               IT portal password must
                                               never leave the server.
                                                 A dedicated backend
                                               layer is non-negotiable
                                               for this application\'s
                                                security requirements.

      **Razorpay           Cleaner UX ---       Requires 2--3 day KYC
      (automated      auto-detect payment, no     process. Framework
      payment)**        manual confirmation      explicitly specifies
                                                   GPay QR. Manual
                                                   confirmation is
                                               acceptable workflow for
                                               a CA firm. Can be added
                                                in Phase 2 if needed.

  **WhatsApp Business   Framework originally   Framework clarification
          API           asked about WhatsApp   specifies email only for
   (notifications)**                             automated messages.
                                                WhatsApp API requires
                                                Meta Business approval
                                                   (3--7 days), DLT
                                                 registration, and is
                                                   more complex to
                                                 maintain. Email via
                                                Resend is simpler and
                                                     sufficient.

   **Microservices**          Appears          1 owner, 2 staff, \~200
                        \'production-grade\'    clients. Microservices
                                                       would be
                                                   catastrophically
                                                   over-engineered.
                                                Operational complexity
                                                 would far exceed the
                                                 firm\'s capacity to
                                               maintain. A monolith is
                                               the correct architecture
                                                here, potentially for
                                                 the lifetime of this
                                                     application.
  ------------------- ------------------------ ------------------------

**DESIGN BRIEF**

Branding inputs from framework: Green & Gold colour scheme. No logo.
Owner name hidden. Professional CA/tax firm context. Mobile-first.
Clients are individual taxpayers and small business owners --- not
tech-savvy. The UI must feel trustworthy, authoritative, and precise ---
like a well-run financial institution, not a startup.

**Design Direction**

Theme: warm-light. A CA firm is not an industrial tool --- it is a
trusted professional advisor. The interface should feel like premium
stationery: cream paper, deep forest green, gold seals of authority.
Think of the aesthetic of a well-regarded chartered accountancy firm\'s
letterhead brought to screen.

+-----------------------------------------------------------------+
| **Design Brief Block (Copy for Stage 2 UI Modules)**            |
|                                                                 |
| DESIGN_BRIEF_START                                              |
|                                                                 |
| THEME: warm-light                                               |
|                                                                 |
| PERSONALITY: precise trustworthy                                |
|                                                                 |
| FONTS:                                                          |
|                                                                 |
| Heading: Cormorant Garamond 700 (editorial serif --- authority, |
| precision, timeless)                                            |
|                                                                 |
| Body: DM Sans 400/500 (clean, readable at small sizes on        |
| mobile)                                                         |
|                                                                 |
| Accent: JetBrains Mono 400 (for reference numbers, PAN/order    |
| IDs --- adds technical precision)                               |
|                                                                 |
| COLORS (CSS variables):                                         |
|                                                                 |
| \--color-bg: #F7F4EE ← warm parchment --- evokes official       |
| documents                                                       |
|                                                                 |
| \--color-surface: #FFFFFF ← pure white for cards/panels         |
|                                                                 |
| \--color-border: #D6C89A ← warm gold-tinted border              |
|                                                                 |
| \--color-text: #1C2B1E ← near-black with green undertone        |
|                                                                 |
| \--color-text-muted: #6B7A6D ← muted sage for labels/secondary  |
| text                                                            |
|                                                                 |
| \--color-primary: #1A5C2E ← deep forest green (brand primary    |
| --- from framework)                                             |
|                                                                 |
| \--color-accent: #B8860B ← antique gold (brand accent --- from  |
| framework)                                                      |
|                                                                 |
| \--color-success: #2E7D32 ← medium green                        |
|                                                                 |
| \--color-warning: #E65100 ← deep amber                          |
|                                                                 |
| \--color-danger: #C62828 ← deep crimson                         |
|                                                                 |
| BACKGROUND: Warm parchment base (#F7F4EE) with a very subtle    |
| diagonal cross-hatch pattern                                    |
|                                                                 |
| (CSS repeating-linear-gradient at 2px × 2px, opacity 0.03) ---  |
| evokes ledger paper without being obvious.                      |
|                                                                 |
| MOTION: Page load --- stagger card entries with 80ms delay      |
| increments (opacity 0 → 1, translateY 12px → 0,                 |
|                                                                 |
| duration 400ms ease-out). Status badge transitions: 200ms color |
| crossfade. File upload zone: gentle                             |
|                                                                 |
| pulsing gold border on drag-over (CSS keyframe animation, 800ms |
| infinite).                                                      |
|                                                                 |
| LAYOUT: Medium density. Cards with 24px padding, 8px border     |
| radius, 1px warm-gold border,                                   |
|                                                                 |
| subtle box-shadow (0 2px 8px rgba(26,92,46,0.08)). Tables       |
| preferred over cards for staff/owner                            |
|                                                                 |
| views (data-dense). Cards for client views (spacious,           |
| approachable). Status indicators as                             |
|                                                                 |
| pill badges with left-colored border --- never just text.       |
|                                                                 |
| AVOID:                                                          |
|                                                                 |
| 1\. Flat-design SaaS blue (#3B82F6) --- this is not a tech      |
| startup, it is a CA firm                                        |
|                                                                 |
| 2\. Dark sidebar with white icons --- reminds clients of        |
| banking apps, not professional advisors                         |
|                                                                 |
| 3\. Rounded, playful illustration-style empty states --- this   |
| is a compliance tool, keep it dignified                         |
|                                                                 |
| REFERENCE: The Economist magazine\'s digital interface +        |
| Notion\'s calm density + Indian government                      |
|                                                                 |
| official portal\'s colour authority --- but with warmth and     |
| mobile-first execution.                                         |
|                                                                 |
| DESIGN_BRIEF_END                                                |
+-----------------------------------------------------------------+

*Note: The DESIGN_BRIEF_START\...END block above must be copied and
injected into every UI module prompt in Stage 2 (frontend development).
It ensures visual consistency across all screens: client onboarding,
work order wizard, document upload, query thread, owner dashboard, and
staff work panel.*

*Document End --- Tech Stack Recommendation v1.0 \| Geetanjali Jojare &
Associates \| Confidential*
