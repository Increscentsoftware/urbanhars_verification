import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
              <span className="text-white font-bold">U</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">UrbanHars Partner</h2>
            <h3 className="text-lg font-semibold text-gray-700">Terms & Conditions</h3>
            <p className="text-sm text-gray-500 mt-2">Effective Date: January 1, 2024<br />Jurisdiction: Bangalore, Karnataka, India</p>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
            {[
              { num: '1', title: 'Independent Contractor Relationship', content: 'By registering on the UrbanHars Partner Portal, you acknowledge that you are entering into an independent contractor relationship with UrbanHars Technologies Pvt. Ltd. You are not an employee, agent, partner, or representative of UrbanHars. You retain full control over your working hours, methods, and tools. UrbanHars acts solely as a technology platform connecting technicians with customers.' },
              { num: '2', title: 'Identity Verification', content: 'You agree to provide accurate and valid identity documents including but not limited to Aadhaar card (front and back), a recent selfie photograph, and any other documents requested by UrbanHars. You authorize UrbanHars to verify your identity through government databases, third-party verification services, or manual review. Applications with invalid, expired, or falsified documents will be permanently rejected.' },
              { num: '3', title: 'Customer Safety Requirements', content: 'You must maintain the highest standards of professional conduct during all customer visits. This includes: (a) treating customers and their property with respect; (b) not engaging in any form of harassment, intimidation, or inappropriate behavior; (c) not entering customer premises beyond the scope of the assigned service; (d) wearing identification provided by UrbanHars during service visits; (e) reporting any safety concerns immediately to UrbanHars support.' },
              { num: '4', title: 'Background Verification Authorization', content: 'You authorize UrbanHars and its designated third-party background check providers to conduct comprehensive background verification including criminal record checks, address verification, employment history verification, and reference checks. You acknowledge that negative results from background verification may result in rejection or suspension of your account.' },
              { num: '5', title: 'Service Quality Standards', content: 'You agree to: (a) complete assigned jobs professionally and within the agreed timeframe; (b) maintain minimum service ratings as specified by UrbanHars; (c) provide honest and accurate service estimates to customers; (d) use quality parts and materials for repairs; (e) provide warranty on your workmanship as specified in the job agreement; (f) respond to customer complaints within 24 hours.' },
              { num: '6', title: 'Fraud Prevention', content: 'Zero tolerance is maintained for fraudulent activities including false billing, charging for services not rendered, recommending unnecessary repairs, creating fake reviews, misrepresenting qualifications or certifications, accepting payments outside the UrbanHars platform. Any fraudulent activity will result in permanent account termination and may be reported to law enforcement authorities.' },
              { num: '7', title: 'Criminal Activity Prohibition', content: 'Technicians convicted of criminal offences including theft, burglary, fraud, financial crimes, assault, domestic violence, sexual offences, harassment, or any offence against persons or property are strictly prohibited from registering on the UrbanHars platform. If UrbanHars discovers such history post-registration, the account will be immediately and permanently terminated.' },
              { num: '8', title: 'Customer Data Privacy', content: 'You agree to maintain strict confidentiality of all customer information accessed during service visits. This includes contact details, home addresses, financial information, and personal details. You must not: (a) retain customer data beyond the service period; (b) share customer information with third parties; (c) use customer data for marketing or solicitation purposes; (d) photograph customer premises without explicit permission.' },
              { num: '9', title: 'Liability Disclaimer', content: 'UrbanHars provides the platform as a marketplace and is not liable for damages arising from technician negligence, workmanship defects, accidents during service delivery, or disputes between technicians and customers. You assume full liability for your service delivery and must maintain appropriate insurance coverage.' },
              { num: '10', title: 'Document Storage Consent', content: 'You consent to UrbanHars collecting, storing, and processing your identity documents, photographs, and personal information in accordance with the Information Technology Act, 2000 and applicable data protection regulations. Documents are stored in encrypted, secure cloud storage and accessed only by authorized UrbanHars personnel.' },
              { num: '11', title: 'GPS Tracking Consent', content: 'During active job assignments, you consent to UrbanHars collecting and processing your GPS location data for the purpose of: (a) matching you with nearby service requests; (b) sharing your location with customers for safety transparency; (c) verifying service completion at customer locations; (d) optimizing route planning and dispatch.' },
              { num: '12', title: 'Account Suspension & Termination', content: 'UrbanHars reserves the right to suspend or permanently terminate accounts for: violations of these terms; customer complaints or poor ratings; inactivity for 90 days; fraudulent activities; criminal behavior; provision of false information. Termination decisions are final and UrbanHars is not obligated to provide detailed reasons.' },
              { num: '13', title: 'Dispute Resolution', content: 'All disputes arising from or relating to these Terms shall be first attempted through good faith negotiation. If unresolved within 30 days, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Bangalore, Karnataka. The language of proceedings shall be English.' },
              { num: '14', title: 'Indemnification', content: 'You agree to indemnify, defend, and hold harmless UrbanHars Technologies Pvt. Ltd., its officers, directors, employees, and agents from and against any claims, damages, costs, and expenses arising from your service activities, violation of these terms, misrepresentation of qualifications, or negligent service delivery.' },
              { num: '15', title: 'Policy Updates', content: 'UrbanHars reserves the right to modify these Terms at any time. Changes will be communicated via SMS, email, or in-app notification. Continued use of the platform after 30 days notice of changes constitutes acceptance of the updated Terms. If you disagree with updated Terms, you must discontinue use and contact UrbanHars to close your account.' },
              { num: '16', title: 'Declaration', content: 'By completing registration and accepting these Terms, you solemnly declare that: all information provided is true, accurate, and complete; you have the legal right to work in India; you have no undisclosed criminal history; you agree to abide by all UrbanHars policies, these Terms, and all applicable Indian laws and regulations.' },
            ].map(section => (
              <div key={section.num} className="border-b border-gray-100 pb-5 last:border-0">
                <h3 className="font-bold text-gray-900 mb-2">{section.num}. {section.title}</h3>
                <p className="text-sm leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center space-y-3">
            <p className="text-xs text-gray-500">
              © 2024 UrbanHars Technologies Pvt. Ltd. | Bangalore, Karnataka, India<br />
              For queries: legal@urbanhars.com
            </p>
            <Link href="/register" className="btn-primary inline-flex" style={{ display: 'inline-flex', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '15px' }}>
              ← Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
