// src/components/Loader.jsx
import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="loader w-16 h-6"></div>
      <p className="mt-3 text-gray-600">{text}</p>

      {/* ✅ Inline styles for the same loader as splash screen */}
      <style>{`
        .loader {
          aspect-ratio: 4;
          --_g: no-repeat radial-gradient(circle closest-side, #2563eb 90%, #0000);
          background: var(--_g) 0% 50%, var(--_g) 50% 50%, var(--_g) 100% 50%;
          background-size: calc(100% / 3) 100%;
          animation: dots 4s infinite linear;
        }
        @keyframes dots {
          33% { background-size: calc(100% / 3) 0%, calc(100% / 3) 100%, calc(100% / 3) 100% }
          50% { background-size: calc(100% / 3) 100%, calc(100% / 3) 0%, calc(100% / 3) 100% }
          66% { background-size: calc(100% / 3) 100%, calc(100% / 3) 100%, calc(100% / 3) 0% }
        }
      `}</style>
    </div>
  );
}
