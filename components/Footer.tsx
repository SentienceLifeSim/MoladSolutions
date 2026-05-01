export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/30 text-sm">
          &copy; {new Date().getFullYear()} Molad Solutions. All rights
          reserved.
        </p>

        <div className="flex gap-6 text-sm text-white/30">
          <a
            href="mailto:Support@moladsolutions.com"
            className="hover:text-white/60 transition-colors"
          >
            Contact
          </a>
          <a href="#" className="hover:text-white/60 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white/60 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
