"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "To create an account, click the Sign Up button on the homepage. You'll need to provide your email, create a password, and select your gender preference. If you're registering as female, you can upload a video introduction.",
    },
    {
      question: "Is CooMeet safe?",
      answer:
        "Yes, safety is our top priority. We verify all users, implement end-to-end encryption for chats, and have a strong reporting system for inappropriate behavior. Our community guidelines are strictly enforced.",
    },
    {
      question: "What are premium features?",
      answer:
        "CooMeet Plus (Monkey Plus) gives you access to advanced gender filters, unlimited matches, priority matching, and exclusive features. You can upgrade anytime from your profile.",
    },
    {
      question: "How does the matching algorithm work?",
      answer:
        "Our intelligent algorithm matches users based on location, gender preferences, interests, and online status. It prioritizes recent activity to ensure you connect with active users.",
    },
    {
      question: "Can I use CooMeet on mobile?",
      answer:
        "CooMeet is optimized for both desktop and mobile browsers. For the best experience, we recommend using a stable internet connection and allowing camera/microphone permissions.",
    },
    {
      question: "What if I encounter an inappropriate user?",
      answer:
        "You can report users directly through the in-call menu. Click the flag icon and describe the issue. Our moderation team reviews reports within 24 hours and takes appropriate action.",
    },
    {
      question: "How do I delete my account?",
      answer:
        "Go to your profile settings, scroll to the bottom, and click 'Delete Account'. Please note that this action is permanent and cannot be undone.",
    },
    {
      question: "Why did my video chat disconnect?",
      answer:
        "Video disconnections can happen due to poor internet connection, browser issues, or if the other user ended the call. Try refreshing the page and checking your connection.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5940df] to-[#3a2a5a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">Find answers to common questions</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#4a3a6a] rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full px-8 py-5 text-left flex items-center justify-between hover:bg-[#5a4a7a] transition"
              >
                <h3 className="text-xl font-bold">{faq.question}</h3>
                <span
                  className={`text-2xl transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {openIndex === index && (
                <div className="px-8 py-5 bg-[#3a2a5a] border-t border-[#5a4a7a]">
                  <p className="text-gray-200 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-[#4a3a6a] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-200 mb-6">
            Can't find the answer you're looking for? Please contact our support team.
          </p>
          <a
            href="/contact-us"
            className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 hover:shadow-lg hover:shadow-pink-500/50 text-white font-bold py-3 px-8 rounded-full transition"
          >
            Contact Support
          </a>
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
