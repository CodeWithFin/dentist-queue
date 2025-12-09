import { Outlet, Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#1d1d1f] border-b border-white/10">
        <div className="h-11 px-4 sm:px-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-inherit no-underline"
          >
            <Stethoscope className="h-4 w-4 text-[#f5f5f7]" />
          </Link>
          <p className="text-xs font-normal text-[#f5f5f7] tracking-tight">
            Book Your Appointment
          </p>
        </div>
      </header>
      <main className="flex-grow py-0">
        <Outlet />
      </main>
      <footer className="py-3 px-2 mt-auto bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-[#86868b] text-center">
            © 2025 Your Dental Clinic. All rights reserved.
          </p>
          <p className="text-sm text-[#86868b] text-center mt-1">
            📞 Contact us: +1 (555) 123-4567 | 📧 info@dentalclinic.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
