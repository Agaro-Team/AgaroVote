import React, { useState } from 'react';

type AccordionItemProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative bg-[var(--card)] backdrop-blur-3xl overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:rounded-xl before:pointer-events-none
      rounded-lg ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-10 w-full flex items-center justify-between px-4 py-5 text-left transition-colors duration-150">
        <span className="text-sm font-bold">{title}</span>
        <svg
          className={`w-5 h-5 ml-2 transform transition-transform duration-150 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden>
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={`px-4 text-sm transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'opacity-100 max-h-96 pb-5' : 'opacity-0 max-h-0'
        }`}
        role="region">
        {children}
      </div>
    </div>
  );
};

export default AccordionItem;
