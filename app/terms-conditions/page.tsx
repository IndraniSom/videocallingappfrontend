"use client";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5940df] to-[#3a2a5a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-xl text-gray-300">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-200 leading-relaxed">
              By accessing and using CooMeet, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. CooMeet reserves the right to update these terms at any time without notice.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">2. Use License</h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on CooMeet's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-gray-200 ml-4">
              <li>• Modify or copy the materials</li>
              <li>• Use the materials for any commercial purpose or for any public display</li>
              <li>• Attempt to decompile or reverse engineer any software contained on CooMeet</li>
              <li>• Remove any copyright or other proprietary notations from the materials</li>
              <li>• Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">3. Disclaimer</h2>
            <p className="text-gray-200 leading-relaxed">
              The materials on CooMeet are provided on an 'as is' basis. CooMeet makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">4. Limitations</h2>
            <p className="text-gray-200 leading-relaxed">
              In no event shall CooMeet or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CooMeet, even if CooMeet or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">5. User Conduct</h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              You agree not to engage in any conduct that violates these terms, including but not limited to:
            </p>
            <ul className="space-y-2 text-gray-200 ml-4">
              <li>• Harassment, bullying, or abusive behavior towards other users</li>
              <li>• Sharing explicit or inappropriate content</li>
              <li>• Attempting to access other users' accounts</li>
              <li>• Spam or unwanted solicitation</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">6. Account Termination</h2>
            <p className="text-gray-200 leading-relaxed">
              CooMeet reserves the right to terminate your account and/or delete your profile if you violate these terms or engage in harmful behavior. Accounts may be terminated at any time at the sole discretion of CooMeet.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 hover:shadow-lg hover:shadow-pink-500/50 text-white font-bold py-4 px-8 rounded-full transition"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
