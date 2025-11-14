"use client";

import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5940df] to-[#3a2a5a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300">
            We'd love to hear from you. Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-[#4a3a6a] rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                📧 Email
              </h3>
              <p className="text-gray-200">support@coomeet.com</p>
              <p className="text-gray-300 text-sm mt-2">
                Response time: 24 hours
              </p>
            </div>

            <div className="bg-[#4a3a6a] rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                📞 Phone
              </h3>
              <p className="text-gray-200">+1 (555) 123-4567</p>
              <p className="text-gray-300 text-sm mt-2">
                Available: Mon-Fri, 9AM-5PM EST
              </p>
            </div>

            <div className="bg-[#4a3a6a] rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                🌍 Location
              </h3>
              <p className="text-gray-200">
                San Francisco, California
                <br />
                United States
              </p>
            </div>

            <div className="bg-[#4a3a6a] rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                ⏰ Response Time
              </h3>
              <p className="text-gray-200">
                We aim to respond to all inquiries within 24 hours. For urgent
                issues, please call us directly.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-[#4a3a6a] rounded-2xl p-8 space-y-5"
            >
              {submitted && (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-green-300">
                  ✓ Thank you! Your message has been sent successfully.
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#3a2a5a] border border-[#5a4a7a] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#3a2a5a] border border-[#5a4a7a] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#3a2a5a] border border-[#5a4a7a] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-[#3a2a5a] border border-[#5a4a7a] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                  placeholder="Tell us more..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:shadow-lg hover:shadow-pink-500/50 text-white font-bold py-3 rounded-lg transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
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
