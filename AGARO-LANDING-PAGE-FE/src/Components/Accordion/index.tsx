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
      className={`border border-transparent dark:border-neutral-700 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-150">
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
        className={`px-4 pb-4 text-sm  transition-[opacity,max-height] duration-200 ease-in-out ${
          open ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
        }`}
        style={{ overflow: 'hidden' }}
        role="region">
        {children}
      </div>
    </div>
  );
};

export default AccordionItem;
