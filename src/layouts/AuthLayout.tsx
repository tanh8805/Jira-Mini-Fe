import { Outlet } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <main className="flex flex-1 items-center justify-center p-6">
        <section className="w-full max-w-md">
          <Outlet />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default AuthLayout;
