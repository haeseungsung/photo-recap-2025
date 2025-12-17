import React from "react";

export const Footer: React.FC<{ fixed?: boolean }> = ({ fixed = false }) => {
  return (
    <footer
      className={`w-full text-center py-4 opacity-30 hover:opacity-60 transition-opacity ${
        fixed ? "fixed bottom-4 left-0 w-full z-10" : ""
      }`}
    >
      <a
        href="https://www.instagram.com/surf.on.pixel"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block"
              aria-hidden="true"
              style={{ verticalAlign: "text-bottom" }}
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16.5 7.5h.01" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            surf.on.pixel
          </span>
        </p>
      </a>
    </footer>
  );
};
