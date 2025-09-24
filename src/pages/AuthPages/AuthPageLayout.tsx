import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {/* Left: Form Content */}
        {children}

        {/* Right: Branding Side with Background Video */}
        <div className="items-center hidden w-full h-full lg:w-1/2 relative lg:grid overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/images/logo/Visialivebackground.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Foreground Content */}
          <div className="relative flex items-center justify-center z-10">
            <GridShape />
            <div className="flex flex-col items-center max-w-lg text-center px-6">
              <Link to="/" className="block mb-8">
                <img
                  src="/images/logo/VisialiveLogo.png"
                  alt="VisaLive AR Logo"
                  className="w-44 sm:w-56 md:w-72 lg:w-80 xl:w-96 object-contain transition-transform duration-500 hover:scale-105"
                />
              </Link>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                VisaLive AR
              </h2>
              <p className="mt-4 text-lg md:text-xl text-white/80 leading-relaxed">
                Transforming images into immersive AR experiences <br />
                with video overlays, 3D objects, and real-time engagement 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
