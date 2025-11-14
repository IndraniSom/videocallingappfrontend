"use client";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5940df] to-[#3a2a5a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">About CooMeet</h1>
          <p className="text-xl text-gray-300">Connecting people through video</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              🎯 Our Mission
            </h2>
            <p className="text-gray-200 leading-relaxed">
              CooMeet is a revolutionary video chat platform designed to bring people together from around the world. Our mission is to create meaningful connections through spontaneous video interactions, breaking down barriers and fostering genuine human connections in the digital age.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              💡 Why CooMeet?
            </h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✓</span>
                <span>Safe and secure video chat platform with verified users</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✓</span>
                <span>Smart matching algorithm to connect compatible users</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✓</span>
                <span>Filter matches by preferences with our premium features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✓</span>
                <span>Built-in messaging system for easy communication</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              👥 Our Community
            </h2>
            <p className="text-gray-200 leading-relaxed">
              With millions of active users worldwide, CooMeet has become the go-to platform for people seeking genuine connections. Our community values respect, kindness, and authentic interactions. Whether you're looking to make new friends or explore romantic connections, CooMeet provides a welcoming environment for everyone.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-[#4a3a6a] rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              🔒 Safety First
            </h2>
            <p className="text-gray-200 leading-relaxed">
              Your safety is our priority. We implement industry-leading security measures, user verification, and community guidelines to ensure a safe experience for all our users. Report harmful behavior, and our team will take immediate action.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 hover:shadow-lg hover:shadow-pink-500/50 text-white font-bold py-4 px-8 rounded-full transition"
          >
            Start Connecting Now
          </a>
        </div>
      </div>
    </div>
  );
}
