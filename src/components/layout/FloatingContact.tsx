"use client";

import { useState } from "react";
import { Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const CONTACT_NUMBER = "8801XXXXXXXXX";

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${CONTACT_NUMBER}`;
  const phoneUrl = `tel:+${CONTACT_NUMBER}`;

  return (
    <div className="fixed bottom-[84px] right-5 z-[60] flex flex-col items-center gap-3 sm:bottom-[94px] sm:right-12">
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-5 scale-75 opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact on WhatsApp"
          tabIndex={isOpen ? 0 : -1}
          className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:scale-110 sm:size-[52px]"
        >
          <FaWhatsapp className="size-[25px]" />
        </a>

        <a
          href={phoneUrl}
          aria-label="Call us"
          tabIndex={isOpen ? 0 : -1}
          className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:scale-110 sm:size-[52px]"
        >
          <Phone className="size-[21px]" strokeWidth={1.7} />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        aria-expanded={isOpen}
        className="relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-transform duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:size-[54px]"
      >
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          className={`absolute size-[32px] transition-all duration-500 sm:size-[35px] ${
            isOpen
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        >
          <path
            d="M9 10.5Q9 7 13 7H35Q39 7 39 11V27Q39 31 35 31H22L13 38V31H13Q9 31 9 27Z"
            fill="white"
          />
          <circle cx="18" cy="19" r="1.8" fill="#171717" />
          <circle cx="24" cy="19" r="1.8" fill="#171717" />
          <circle cx="30" cy="19" r="1.8" fill="#171717" />
        </svg>

        <X
          className={`absolute size-[23px] transition-all duration-500 ${
            isOpen
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          strokeWidth={1.7}
        />
      </button>
    </div>
  );
}
