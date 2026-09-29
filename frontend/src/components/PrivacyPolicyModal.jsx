import React from 'react'
import { Shield, Lock, X, CheckCircle2, FileText, Server, EyeOff, UserCheck } from 'lucide-react'

export default function PrivacyPolicyModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div 
        className="bg-[var(--color-surface)] w-full max-w-3xl rounded-xl shadow-2xl border border-[var(--color-border)] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-[var(--color-bg)] to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-[var(--color-primary)] leading-tight">
                Data Privacy Policy & Storage Consent
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">
                Geetanjali Jojare & Associates • Tax & Compliance Platform
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Trust Badges Banner */}
        <div className="bg-[var(--color-primary)] text-white px-6 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
            <span><strong>AES-256 Encryption</strong> for all documents</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-300 shrink-0" />
            <span><strong>Zero Data Selling</strong> to advertisers</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span><strong>DPDP & IT Act</strong> Compliant</span>
          </div>
        </div>

        {/* Scrollable Policy Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[var(--color-text)] leading-relaxed">
          
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-950">Summary Notice:</strong> By creating an account, you grant explicit authorization to <em>Geetanjali Jojare & Associates</em> to securely store, process, and transmit your Income Tax data strictly for tax filing, computation, and official Income Tax Department (ITD) submissions.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-[var(--color-primary)] font-heading border-b border-gray-100 pb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-body">1</span>
              Scope & Regulatory Compliance
            </h3>
            <p>
              This Privacy Policy governs the collection, storage, security, and usage of personal data provided by clients using the ITR Filing Management Platform operated by <strong>Geetanjali Jojare & Associates</strong>. We adhere strictly to the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong> (and applicable IT rules).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-[var(--color-primary)] font-heading border-b border-gray-100 pb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-body">2</span>
              Information We Collect & Process
            </h3>
            <p>To prepare, compute, and e-file your Income Tax Returns (ITR), we collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-text)]">
              <li><strong>Personal Identifiers:</strong> Full legal name, date of birth, mobile number, email address, and residential address.</li>
              <li><strong>Statutory Identity Keys:</strong> Permanent Account Number (PAN), Aadhaar number (where authorized by you for e-verification).</li>
              <li><strong>Financial & Income Documentation:</strong> Form 16 / 16A, salary slips, bank account statements, interest certificates, capital gains computations, home loan details, and tax-saving investment proofs (80C, 80D, etc.).</li>
              <li><strong>E-Filing Credentials:</strong> Income Tax Department portal login credentials or OTP authorization tokens used strictly for filing on your behalf.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-[var(--color-primary)] font-heading border-b border-gray-100 pb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-body">3</span>
              Purpose of Data Collection & Processing
            </h3>
            <p>Your data is processed exclusively for legitimate statutory and professional purposes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <strong className="block text-xs text-[var(--color-primary)] font-semibold mb-1">ITR Preparation & Computation</strong>
                Accurate determination of taxable income, deductions, and tax liabilities.
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <strong className="block text-xs text-[var(--color-primary)] font-semibold mb-1">Government E-Filing</strong>
                Direct transmission of return data to the Income Tax Department portal.
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <strong className="block text-xs text-[var(--color-primary)] font-semibold mb-1">Query Resolution & Verification</strong>
                Auditing uploaded documents and resolving tax notices or queries raised.
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <strong className="block text-xs text-[var(--color-primary)] font-semibold mb-1">Client Record Archiving</strong>
                Providing you access to your historical ITR-V acknowledgements & filing reports.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-[var(--color-primary)] font-heading border-b border-gray-100 pb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-body">4</span>
              Data Protection, Storage & Encryption Vault
            </h3>
            <p>
              We implement enterprise-grade security measures to safeguard your financial privacy:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>256-bit Vault Encryption:</strong> Highly sensitive fields and credentials are encrypted using an AES-256 Encryption Vault key before database storage.</li>
              <li><strong>Cloud Storage Security:</strong> Documents are hosted in secure Supabase Storage buckets governed by strict Row Level Security (RLS) policies. Only you and authorized firm tax staff can access your files.</li>
              <li><strong>Role-Based Access Control:</strong> Strict internal controls ensure staff access is limited strictly on a need-to-know basis for active service orders.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-[var(--color-primary)] font-heading border-b border-gray-100 pb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-body">5</span>
              Data Sharing & Disclosure Policy
            </h3>
            <p>
              We maintain a <strong>strict non-disclosure policy</strong>. We never sell, rent, lease, or monetize your personal or financial information to third-party marketing companies, brokers, or advertisers.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] italic">
              Data disclosure is restricted strictly to: (a) Official government tax authorities (Income Tax Department of India) for filing purposes, or (b) Compliance with binding legal court orders or statutory mandates.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="text-base font-bold text-[var(--color-primary)] font-heading border-b border-gray-100 pb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center font-body">6</span>
              Your Rights & Consent Revocation
            </h3>
            <p>Under applicable privacy regulations, you possess the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Review and update your profile and tax details at any time.</li>
              <li>Download your uploaded documents and completed ITR acknowledgements.</li>
              <li>Request account closure and deletion of temporary staging files upon order completion (subject to statutory tax record retention requirements).</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 bg-emerald-50/60 p-4 border border-emerald-200 rounded-lg">
            <h3 className="text-sm font-bold text-[var(--color-success)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              Explicit Storage & Power of Attorney Consent
            </h3>
            <p className="text-xs text-emerald-950">
              By checking the consent box during registration, you confirm that you are the lawful owner or authorized representative of the provided tax documents, and you explicitly consent to the electronic storage, processing, and submission of your ITR by <strong>Geetanjali Jojare & Associates</strong>.
            </p>
          </section>

          {/* Contact Details */}
          <div className="pt-2 text-xs text-[var(--color-text-muted)] border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <strong>Data Protection & Grievance Desk:</strong> privacy@jojareitr.com
            </div>
            <div>
              <strong>Last Updated:</strong> September 2026
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-text-muted)] text-center sm:text-left">
            Please read the terms carefully before accepting.
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAccept) onAccept()
                onClose()
              }}
              className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              I Agree & Accept Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
