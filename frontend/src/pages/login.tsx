import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Store, UserRound, BadgeDollarSign } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      if (response.data.role === "cashier") {
        navigate("/pos");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: "owner" | "cashier") => {
    const demoEmail = role === "owner" ? "yash@gmail.com" : "cashier@gmail.com";
    const demoPassword = "123456";

    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: demoEmail,
        password: demoPassword,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      if (response.data.role === "cashier") {
        navigate("/pos");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Demo login failed:", error);
      setError("Demo login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
                <Store size={26} />
              </div>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                RestaurantOS keeps service, sales, and billing in one calm workspace.
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-2xl font-bold">POS</p>
                <p className="mt-1 text-slate-300">Fast billing</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-2xl font-bold">KPI</p>
                <p className="mt-1 text-slate-300">Live insights</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-2xl font-bold">PDF</p>
                <p className="mt-1 text-slate-300">Bills ready</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Store size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold">RestaurantOS</h1>
                <p className="text-sm text-slate-500">Management & POS</p>
              </div>
            </div>

            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Welcome back
                </p>
                <h2 className="mt-2 text-3xl font-bold">Sign in to continue</h2>
                <p className="mt-2 text-slate-500">
                  Access your dashboard or jump straight into POS mode.
                </p>
              </div>

              <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="mb-3 text-sm font-semibold text-emerald-800">
                  Demo Access
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("owner")}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <UserRound size={16} />
                    Use Owner Demo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin("cashier")}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    <BadgeDollarSign size={16} />
                    Use Cashier Demo
                  </button>
                </div>

                <p className="mt-3 text-xs text-emerald-700">
                  Recruiters can explore dashboard analytics, POS billing, and PDF bill generation instantly.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      type="email"
                      placeholder="owner@restaurant.com"
                      className="w-full py-3 outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                    <LockKeyhole size={18} className="text-slate-400" />
                    <input
                      type="password"
                      placeholder="Enter password"
                      className="w-full py-3 outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-slate-950 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isLoading ? <LoadingSpinner label="Signing in" /> : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Create account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default login;