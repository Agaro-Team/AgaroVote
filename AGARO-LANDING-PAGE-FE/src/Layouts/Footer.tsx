import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--light-glow)] rounded flex items-center justify-center">
                {/* placeholder logo circle */}
                <span className="sr-only">Logo</span>
              </div>
              <h3 className="text-lg font-semibold">Logoipsum</h3>
            </div>
            <p className="mt-4 text-sm opacity-90">
              Your Voice, Verified with
              <br />
              Web3 Transparency
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:w-1/2">
            <div>
              <h4 className="text-sm font-semibold">Navigation</h4>
              <ul className="mt-4 space-y-3 text-sm opacity-90">
                <li className="hover:underline cursor-pointer">Overview</li>
                <li className="hover:underline cursor-pointer">Benefit</li>
                <li className="hover:underline cursor-pointer">Features</li>
                <li className="hover:underline cursor-pointer">Testimonials</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Information</h4>
              <ul className="mt-4 space-y-3 text-sm opacity-90">
                <li className="hover:underline cursor-pointer">FAQ</li>
                <li className="hover:underline cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
