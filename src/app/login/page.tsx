"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isLogin) {
        // Registration Flow
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        if (!res.ok) {
          const errorMsg = await res.text();
          setError(errorMsg || "Registration failed.");
          setLoading(false);
          return;
        }
      }

      // Login Flow
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: "/admin/dashboard",
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
      } else if (res?.ok) {
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    signIn("google", { callbackUrl: "/admin/dashboard" }).catch(() => {
      setError("Google Sign-In is not configured yet. Please sign in with email and password.");
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 relative">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 md:top-10 md:left-12 flex items-center gap-2 text-[11px] text-gray-400 hover:text-black transition-colors tracking-[0.18em] uppercase font-sans"
      >
        <ArrowLeft size={13} />
        Back to Store
      </Link>

      {/* Centered Clean Login Card */}
      <div className="w-full max-w-[390px] mx-auto flex flex-col items-center my-auto">
        {/* Headers */}
        <div className="text-center mb-9 w-full">
          <h1 className="text-[30px] md:text-[34px] font-garamond text-gray-900 mb-2 tracking-tight">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h1>
          <p
            className="text-[13px] text-gray-400 font-garamond italic"
            style={{ fontFamily: "var(--font-body), 'EB Garamond', Garamond, Georgia, serif" }}
          >
            {isLogin ? "Enter Your Details Below" : "Fill in your details below to get started"}
          </p>
        </div>

        <form suppressHydrationWarning onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-[13px] text-center border border-red-100 font-sans">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-400 tracking-[0.08em] font-sans">
              Email
            </label>
            <input
              suppressHydrationWarning
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 pb-2 text-[14px] text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300 font-sans"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-400 tracking-[0.08em] font-sans">
              Password
            </label>
            <div className="relative">
              <input
                suppressHydrationWarning
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 pb-2 text-[14px] text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent tracking-widest placeholder:text-gray-300 pr-8 font-sans"
              />
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Only for Sign Up) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 tracking-[0.08em] font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-b border-gray-300 pb-2 text-[14px] text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent tracking-widest placeholder:text-gray-300 pr-8 font-sans"
                />
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          {isLogin && (
            <div className="flex justify-between items-center text-[12px] text-gray-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded-sm border-gray-300 accent-black text-black cursor-pointer"
                />
                <span className="text-[12px] text-gray-500 font-sans group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                suppressHydrationWarning
                type="button"
                className="text-[12px] text-gray-400 hover:text-gray-900 transition-colors font-sans cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button (Cart count blue) */}
          <button
            suppressHydrationWarning
            type="submit"
            disabled={loading}
            style={{ fontFamily: "var(--font-body), 'EB Garamond', Garamond, Georgia, serif" }}
            className="w-full bg-[#4A7DAF] text-white rounded-full font-garamond tracking-[0.16em] uppercase text-[15px] py-4 mt-4 hover:bg-[#3d6892] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? "Authenticating..." : isLogin ? "LOG IN" : "SIGN UP"}
          </button>

          {/* Google Button (Garamond font) */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={handleGoogleLogin}
            style={{ fontFamily: "var(--font-body), 'EB Garamond', Garamond, Georgia, serif" }}
            className="w-full bg-[#f4f4f5] text-gray-800 rounded-full font-garamond tracking-[0.16em] uppercase text-[14px] py-4 flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25C22.56 11.47 22.49 10.71 22.36 9.97H12V14.28H17.92C17.66 15.68 16.88 16.85 15.7 17.64V20.45H19.27C21.36 18.52 22.56 15.65 22.56 12.25Z"
                fill="#4285F4"
              />
              <path
                d="M12 23C14.97 23 17.46 22.02 19.27 20.45L15.7 17.64C14.72 18.3 13.48 18.7 12 18.7C9.13 18.7 6.7 16.76 5.83 14.16H2.15V17.02C3.96 20.6 7.68 23 12 23Z"
                fill="#34A853"
              />
              <path
                d="M5.83 14.16C5.61 13.49 5.48 12.76 5.48 12C5.48 11.24 5.61 10.51 5.83 9.84V6.98H2.15C1.4 8.47 0.98 10.18 0.98 12C0.98 13.82 1.4 15.53 2.15 17.02L5.83 14.16Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.29C13.61 5.29 15.06 5.84 16.21 6.94L19.34 3.8C17.45 2.05 14.97 1 12 1C7.68 1 3.96 3.4 2.15 6.98L5.83 9.84C6.7 7.24 9.13 5.29 12 5.29Z"
                fill="#EA4335"
              />
            </svg>
            {isLogin ? "LOG IN WITH GOOGLE" : "SIGN UP WITH GOOGLE"}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="mt-12 text-center text-[12px] text-gray-400 font-sans">
          <span>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            suppressHydrationWarning
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setConfirmPassword("");
            }}
            className="text-gray-900 font-semibold hover:underline ml-1 cursor-pointer"
          >
            {isLogin ? "Sign Up" : "Log in"}
          </button>
        </div>
      </div>
    </main>
  );
}
