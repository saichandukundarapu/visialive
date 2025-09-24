import  { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

export default function Home1() {
  const [publicVideo, setPublicVideo] = useState<string | null>(null);

  // ✅ Fetch public video from Xano
  useEffect(() => {
    const fetchPublicVideo = async () => {
      try {
        const res = await fetch(
          "https://x73t-i3sy-hy16.n7e.xano.io/api:iYpTp_60/publicurl"
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPublicVideo(data[0].video?.url || null);
        } else if (data.video?.url) {
          setPublicVideo(data.video.url);
        }
      } catch (err) {
        console.error("Error fetching public video:", err);
      }
    };
    fetchPublicVideo();
  }, []);

  // ✅ Reusable Section Component
  const ShowcaseSection = ({
    id,
    title,
    description,
    mediaType,
    mediaSrc,
    reverse = false,
  }: {
    id: string;
    title: string;
    description: string;
    mediaType: "video" | "image";
    mediaSrc: string | null;
    reverse?: boolean;
  }) => (
    <section
      id={id}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 py-12"
    >
      {/* Top text */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`absolute top-6 ${
          reverse ? "right-6 sm:right-12 text-right" : "left-6 sm:left-12 text-left"
        } max-w-md text-2xl sm:text-3xl md:text-4xl font-extrabold text-black z-20`}
      >
        {title}
      </motion.p>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className={`absolute bottom-6 ${
          reverse ? "left-6 sm:left-12 text-left" : "right-6 sm:right-12 text-right"
        } max-w-md text-lg sm:text-xl md:text-2xl font-light text-black z-20`}
      >
        {description}
      </motion.p>

      {/* Media */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.5 }}
        className="flex justify-center items-center w-full max-w-3xl z-10"
      >
        {mediaType === "video" ? (
          <video
            src={mediaSrc || ""}
            autoPlay
            muted
            loop
            controls
            className="w-full aspect-video object-cover rounded-2xl shadow-2xl"
          />
        ) : (
          <img
            src={mediaSrc || ""}
            alt="Showcase Example"
            className="w-full aspect-video object-contain transform transition duration-500 hover:scale-105"
          />
        )}
      </motion.div>
    </section>
  );

  return (
    <>
      <PageMeta title="VisaLive AR" description="Immersive AR Experiences" />

      {/* 🌈 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/images/logo/Visialivebackground.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* White overlay for readability */}
      <div className="fixed inset-0 bg-white/60 -z-10"></div>

      {/* 🔹 Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-black">
          VisaLive AR
        </h1>
        <div className="space-x-3 sm:space-x-4 flex">
          <Link
            to="/signin"
            className="px-4 sm:px-5 py-2 rounded-lg bg-pink-500/70 text-black font-semibold text-sm sm:text-base backdrop-blur-sm transition duration-300 ease-in-out hover:scale-105 hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.8)]"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 sm:px-5 py-2 rounded-lg bg-purple-500/70 text-black font-semibold text-sm sm:text-base backdrop-blur-sm transition duration-300 ease-in-out hover:scale-110 hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.9)]"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* 🔹 Main Content */}
      <main className="relative z-10 space-y-12 pt-5">
        {/* Hero Section */}
        <section
          id="about"
          className="min-h-screen flex flex-col items-center justify-center text-center text-black px-6"
        >
          <motion.img
            src="/images/logo/VisialiveLogo.png"
            alt="VisaLive Logo"
            className="w-100 sm:w-100 md:w-150 lg:w-150 object-contain mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: [0, -15, 0] }}
            transition={{ ease: "easeInOut" }}
          />
{/* Section Divider */}

          {/* Scrolling Text */}
          <div className="w-full overflow-hidden bg-transparent py-6">
            <div className="scroll-wrapper flex whitespace-nowrap">
              <div className="scroll-text font-extrabold text-xl md:text-2xl text-black">
                Transform images into immersive AR experiences with video overlays, 3D objects, and real-time engagement ✦
              </div>
              <div className="scroll-text font-extrabold text-xl md:text-2xl text-black">
                Transform images into immersive AR experiences with video overlays, 3D objects, and real-time engagement ✦
              </div>
            </div>
          </div>
        </section>
{/* Section Divider */}
<div className="w-full px-4 sm:px-12 md:px-24 lg:px-40 my-12">
  <hr className="border-t border-black/60" />
</div>

        {/* Showcase Sections */}
        <ShowcaseSection
          id="video1"
          title="Elevating Ideas Through AR Innovation"
          description="Seamlessly blending technology and creativity to craft experiences that engage, inspire, and connect audiences worldwide."
          mediaType="video"
          mediaSrc={publicVideo}
          reverse={false}
        />
        {/* Section Divider */}
<div className="w-full px-4 sm:px-12 md:px-24 lg:px-40 my-12">
  <hr className="border-t border-black/60" />
</div>

        <ShowcaseSection
          id="image1"
          title="Redefining Visual Storytelling"
          description="Capturing imagination with striking imagery, immersive design, and creative expression that speaks louder than words."
          mediaType="image"
          mediaSrc="/images/logo/Image1.png"
          reverse={true}
        />
        {/* Section Divider */}
<div className="w-full px-4 sm:px-12 md:px-24 lg:px-40 my-12">
  <hr className="border-t border-black/60" />
</div>

        <ShowcaseSection
          id="video2"
          title="Bringing Ideas to Life"
          description="From concepts to captivating AR interactions — pushing the boundaries of digital engagement."
          mediaType="video"
          mediaSrc={publicVideo}
          reverse={false}
        />
        {/* Section Divider */}
<div className="w-full px-4 sm:px-12 md:px-24 lg:px-40 my-12">
  <hr className="border-t border-black/60" />
</div>

       <ShowcaseSection
  id="video3"
  title="Creative Expression Without Limits"
  description="Where imagination meets technology, turning static visuals into unforgettable immersive journeys."
  mediaType="video"
  mediaSrc="/images/logo/Sm1.mp4"
  reverse={true}
/>

{/* Section Divider */}
<div className="w-full px-4 sm:px-12 md:px-24 lg:px-40 my-12">
  <hr className="border-t border-black/60" />
</div>

        {/* Contact */}
        <section id="contact" className="text-center text-black px-6 py-20 space-y-4">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="max-w-xl mx-auto text-black/80">
            Interested in AR experiences? Reach out to us for collaborations, demos, or partnerships.
          </p>
          <a
            href="mailto:contact@visalive.com"
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
          >
            Contact Us
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-black py-6 text-sm">
        © {new Date().getFullYear()} VisaLive AR · All rights reserved
      </footer>

      {/* CSS for scrolling text */}
      <style>{`
        .scroll-wrapper {
          display: inline-flex;
          animation: scroll-left 25s linear infinite;
        }
        .scroll-text {
          padding-right: 3rem;
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
