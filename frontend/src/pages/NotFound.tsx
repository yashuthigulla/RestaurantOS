import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

function NotFound() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const homePath = token ? (role === "cashier" ? "/pos" : "/dashboard") : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <SearchX size={32} />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-500">
          The page you are looking for does not exist or may have moved.
        </p>

        <Link
          to={homePath}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          <Home size={18} />
          Go home
        </Link>
      </section>
    </div>
  );
}

export default NotFound;
