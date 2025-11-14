"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5940df] to-[#3a2a5a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">Last updated: January 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-200 leading-relaxed">
              CooMeet ("we", "our", or "us") operates the CooMeet website and
              application. This page informs you of our policies regarding the
              collection, use, and disclosure of personal data when you use our
              service and the choices you have associated with that data. We use
              your data to provide and improve the service.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              2. Information Collection and Use
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              We collect several different types of information for various
              purposes to provide and improve our service to you.
            </p>
            <ul className="space-y-3 text-gray-200">
              <li>
                <strong>Personal Data:</strong> While using our service, we may
                ask you to provide us with certain personally identifiable
                information that can be used to contact or identify you
                ("Personal Data"). This may include, but is not limited to:
              </li>
              <li className="ml-4">• Email address</li>
              <li className="ml-4">• First name and last name</li>
              <li className="ml-4">• Gender</li>
              <li className="ml-4">• Location</li>
              <li className="ml-4">• Video recordings</li>
              <li className="ml-4">• Cookies and usage data</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              3. Use of Data
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              CooMeet uses the collected data for various purposes:
            </p>
            <ul className="space-y-2 text-gray-200 ml-4">
              <li>• To provide and maintain our service</li>
              <li>• To notify you about changes to our service</li>
              <li>• To allow you to participate in interactive features of our service</li>
              <li>• To provide customer support</li>
              <li>• To gather analysis or valuable information so we can improve our service</li>
              <li>• To monitor the usage of our service</li>
              <li>• To detect, prevent, and address technical and security issues</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              4. Security of Data
            </h2>
            <p className="text-gray-200 leading-relaxed">
              The security of your data is important to us, but remember that no
              method of transmission over the Internet or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your Personal Data, we cannot guarantee
              its absolute security. We use industry-standard encryption and
              security protocols to protect your information.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-200 leading-relaxed">
              CooMeet will retain your Personal Data only for as long as necessary
              for the purposes set out in this Privacy Policy. We will retain and
              use your Personal Data to the extent necessary to comply with our
              legal obligations.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              6. Your Privacy Rights
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-gray-200 ml-4">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Opt-out of certain data processing activities</li>
              <li>• Data portability (receive your data in a structured format)</li>
            </ul>
            <p className="text-gray-200 leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@coomeet.com
            </p>
          </div>

          {/* Section 7 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              7. Third-Party Links
            </h2>
            <p className="text-gray-200 leading-relaxed">
              Our service may contain links to other sites that are not operated
              by us. This Privacy Policy applies only to information we collect
              on our service. We are not responsible for the privacy practices
              of other websites and encourage you to review the privacy policies
              of any third-party service before providing your personal information.
            </p>
          </div>

          {/* Section 8 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-200 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date at the top of this page. You
              are advised to review this Privacy Policy periodically for any
              changes.
            </p>
          </div>

          {/* Section 9 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-200 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact
              us at:
            </p>
            <p className="text-gray-200 mt-4">
              📧 Email: privacy@coomeet.com
              <br />
              🌐 Website: www.coomeet.com
              <br />
              📍 Address: San Francisco, California, United States
            </p>
          </div>
        </div>

        {/* Footer CTA */}
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
