"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@pausepalette.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials.");
      } else if (res?.ok) {
        // We let middleware handle the redirect if they try to access /admin directly,
        // but here we can just push to /admin/dashboard and middleware will kick them out if they aren't admin.
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/admin/dashboard" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 lg:gap-24 items-center h-full">
        
        {/* Left Side: Rounded Image */}
        <div className="hidden lg:block lg:w-1/2 h-[80vh] relative rounded-[40px] overflow-hidden shadow-sm">
          <img 
            src="/images/gif/login.gif" 
            alt="Pause Palette Lifestyle" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Clean Modern Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center max-w-md mx-auto relative">
          
          {/* Headers */}
          <div className="text-center mb-10 w-full">
            <h1 className="text-[32px] font-serif text-gray-900 mb-3 tracking-tight">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h1>
            <p className="text-[14px] text-gray-400 font-sans">
              {isLogin ? "Enter Your Details Below" : "Fill in your details below to get started"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] text-gray-400 font-medium ml-1">Email</label>
              <input 
                suppressHydrationWarning
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-300 pb-2 px-1 text-[15px] text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-300"
              />
            </div>
            
            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] text-gray-400 font-medium ml-1">Password</label>
              <div className="relative">
                <input 
                  suppressHydrationWarning
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b border-gray-300 pb-2 px-1 text-[15px] text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent tracking-widest placeholder:text-gray-300 pr-8"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-0 text-gray-500 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {isLogin && (
              <div className="flex justify-between items-center mt-2 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded-sm border border-gray-300 flex items-center justify-center group-hover:border-gray-500 transition-colors">
                    <svg className="w-3 h-3 text-gray-600 hidden group-hover:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[12px] text-gray-500 font-medium">Remember me</span>
                </label>
                <button type="button" className="text-[12px] text-gray-400 hover:text-gray-800 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button 
              suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-white rounded-full font-serif tracking-widest uppercase text-[13px] py-4 mt-6 hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : (isLogin ? "Log in" : "Sign Up")}
            </button>

            {/* Google Button */}
            <button 
              suppressHydrationWarning
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-[#f4f4f5] text-gray-900 rounded-full font-serif tracking-widest uppercase text-[13px] py-4 flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.71 22.36 9.97H12V14.28H17.92C17.66 15.68 16.88 16.85 15.7 17.64V20.45H19.27C21.36 18.52 22.56 15.65 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.27 20.45L15.7 17.64C14.72 18.3 13.48 18.7 12 18.7C9.13 18.7 6.7 16.76 5.83 14.16H2.15V17.02C3.96 20.6 7.68 23 12 23Z" fill="#34A853"/>
                <path d="M5.83 14.16C5.61 13.49 5.48 12.76 5.48 12C5.48 11.24 5.61 10.51 5.83 9.84V6.98H2.15C1.4 8.47 0.98 10.18 0.98 12C0.98 13.82 1.4 15.53 2.15 17.02L5.83 14.16Z" fill="#FBBC05"/>
                <path d="M12 5.29C13.61 5.29 15.06 5.84 16.21 6.94L19.34 3.8C17.45 2.05 14.97 1 12 1C7.68 1 3.96 3.4 2.15 6.98L5.83 9.84C6.7 7.24 9.13 5.29 12 5.29Z" fill="#EA4335"/>
              </svg>
              {isLogin ? "Log in with Google" : "Sign up with Google"}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="mt-16 text-center">
            <span className="text-[12px] text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              suppressHydrationWarning
              onClick={() => setIsLogin(!isLogin)}
              className="text-[12px] text-gray-800 font-bold hover:underline ml-1"
            >
              {isLogin ? "Sign Up" : "Log in"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
