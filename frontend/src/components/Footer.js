"use client";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-12 border-t border-outline-variant mt-auto">
      <div className="flex flex-col items-center gap-4 max-w-[1280px] mx-auto px-4 md:px-10 text-center">
        <div className="flex flex-wrap justify-center gap-6">
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary underline decoration-outline-variant/30 transition-all cursor-pointer">
            Terms of Service
          </a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary underline decoration-outline-variant/30 transition-all cursor-pointer">
            Privacy Policy
          </a>
          <a className="font-label-sm text-label-sm text-secondary hover:text-primary underline decoration-outline-variant/30 transition-all cursor-pointer">
            Contact Support
          </a>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          © 2026 Chef Qwen. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
