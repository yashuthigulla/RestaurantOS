import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <section className="w-full rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 text-white">
              <UserRound size={26} />
            </div>
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-slate-500">
              Register an owner account and return to login.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <UserRound size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full py-3 outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
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
                  placeholder="Create password"
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
              {isLoading ? <LoadingSpinner label="Creating account" /> : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Back to login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Register;
