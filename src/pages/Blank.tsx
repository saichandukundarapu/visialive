
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination, Autoplay } from "swiper/modules";

export default function VisaLiveLanding() {
  return (
    <div className="min-h-screen text-gray-800 bg-gradient-to-b from-pink-50 via-purple-50 to-indigo-50">
      {/* ================= HERO ================= */}
      <section className="relative text-center py-20 px-6">
        <span className="inline-block px-5 py-1 rounded-full border border-purple-200 text-purple-600 text-sm font-medium mb-6">
          ★ About VisaLive AR
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mx-auto">
          Experience The Future of Augmented Reality With VisaLive
        </h1>
        <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
          Transforming how you connect with the world through immersive
          augmented reality — simple, powerful, and interactive.
        </p>
        <div className="mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-lg hover:opacity-90 transition">
            Contact Us →
          </button>
        </div>
      </section>

      {/* ================= IMAGE SLIDER ================= */}
     <section className="max-w-6xl mx-auto py-20 px-6">
  <h2 className="text-3xl font-bold text-center mb-10">
    Explore AR Campaigns
  </h2>
  <Swiper
    modules={[Pagination, Autoplay]}
    pagination={{ clickable: true }}
    autoplay={{ delay: 3000, disableOnInteraction: false }}
    loop
    spaceBetween={20}
    slidesPerView={1}
    breakpoints={{
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }}
  >
    {[
      "https://tse2.mm.bing.net/th/id/OIP.FNvG0Z7GHVw18lf7iTJQ8wHaDW?pid=Api", // AR retail experience
      "https://tse3.mm.bing.net/th/id/OIP.u61G03fF8YA20LlKG5tozgHaEo?pid=Api", // AR in events
      "https://tse3.mm.bing.net/th/id/OIP.vOWnKvcQCPz9TzgyJJZgywHaE8?pid=Api", // AR design/business
      "https://tse4.mm.bing.net/th/id/OIP.zOhVU9PnHmhyYwpr2gPruwHaE7?pid=Api", // AR entertainment
    ].map((img, idx) => (
      <SwiperSlide key={idx}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-2xl shadow-lg overflow-hidden"
        >
          <img
            src={img}
            alt={`AR Campaign ${idx + 1}`}
            className="w-full h-64 object-cover"
          />
        </motion.div>
      </SwiperSlide>
    ))}
  </Swiper>
</section>


      {/* ================= VIDEO SECTION ================= */}
      <section className="bg-gradient-to-r from-purple-50 to-indigo-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            Watch VisaLive AR in Action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            A glimpse of how VisaLive transforms images into immersive AR
            experiences with video overlays, 3D objects, and real-time
            engagement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            <video
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              autoPlay
              muted
              loop
              controls
              className="w-full h-[400px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= TRUSTED PROVIDERS ================= */}
      <section className="max-w-7xl mx-auto py-20 px-6 grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-3xl font-bold mb-4">Your Trusted AR Providers</h2>
          <p className="text-gray-600 mb-6">
            We provide businesses with secure and scalable AR solutions —
            empowering campaigns, education, and immersive storytelling.
          </p>
          <button className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
            Make a Demo
          </button>
        </div>
        <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold mb-3">Fast & Secure</h3>
          <p>Upload AR media, manage campaigns, and track results in one place.</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-3">Performance Insights</h3>
          <p className="text-gray-600">
            Real-time analytics of audience engagement across all devices.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6">
        {[
          { number: "100%", label: "Client Satisfaction" },
          { number: "25M+", label: "AR Views Generated" },
          { number: "99%", label: "Uptime & Reliability" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl shadow bg-white text-center"
          >
            <p className="text-3xl font-bold text-purple-600">{stat.number}</p>
            <p className="text-gray-600 mt-2">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ================= GOAL ================= */}
      <section className="max-w-7xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Let’s Know Our Main Goal</h2>
          <p className="text-gray-600 mb-6">
            VisaLive AR is committed to making augmented reality accessible,
            measurable, and business-driven for creators and enterprises alike.
          </p>
          <ul className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <li>✅ Simple Uploads</li>
            <li>✅ Instant QR Codes</li>
            <li>✅ AR Insights</li>
            <li>✅ Secure & Scalable</li>
          </ul>
        </div>
        <div>
       <img
  src="https://tse3.mm.bing.net/th/id/OIP.vOWnKvcQCPz9TzgyJJZgywHaE8?pid=Api"
  alt="AR Goal"
  className="rounded-2xl shadow-lg"
/>

        </div>
      </section>

      {/* ================= TEAM ================= */}
     

      {/* ================= VISION ================= */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          Key Visions of VisaLive
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Immersive AR Experiences",
            "Business-Friendly Tools",
            "Real-Time Analytics",
            "Global Scalability",
            "Seamless Integration",
            "Future of Engagement",
          ].map((vision, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl shadow hover:shadow-md"
            >
              <p className="text-purple-600 font-bold text-lg mb-2">
                0{idx + 1}
              </p>
              <h3 className="font-semibold mb-2">{vision}</h3>
              <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center shadow-xl">
          {/* Decorative bubbles */}
          <div className="absolute -left-10 -bottom-10 w-60 h-60">
            <img
              src="https://assets-global.website-files.com/63a4f5f1c2e1c32f8fa84b15/63a4f7c9a7e0e524e8a1a6cf_sphere-purple.png"
              alt="bubble left"
              className="w-full h-full object-contain opacity-80"
            />
          </div>
          <div className="absolute -right-12 -top-12 w-64 h-64">
            <img
              src="https://assets-global.website-files.com/63a4f5f1c2e1c32f8fa84b15/63a4f7c9a7e0e524e8a1a6cf_sphere-purple.png"
              alt="bubble right"
              className="w-full h-full object-contain opacity-80"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Bring your customer services the next level of excellence.
            </h2>
            <button className="px-6 py-3 bg-white text-purple-700 font-medium rounded-full shadow hover:opacity-90 transition">
              Make a schedule →
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">VisaLive AR</h3>
            <p className="text-sm text-gray-400">
              Immersive AR for businesses & creators worldwide.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Solutions</h4>
            <ul className="space-y-2 text-sm">
              <li>Business AR</li>
              <li>Education AR</li>
              <li>Marketing Campaigns</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Contact</h4>
            <p className="text-sm">support@visalive.com</p>
            <p className="text-sm">+1 (234) 567-890</p>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-10">
          © {new Date().getFullYear()} VisaLive AR. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
