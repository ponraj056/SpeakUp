"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { Mic, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Smartphone, Globe, Users, Briefcase } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const socialAuth = useAuthStore((s) => s.socialAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginMethod === "password") {
        await login(email, password);
        router.push("/dashboard");
      } else {
        if (!otpSent) {
          await requestOtp(email);
          setOtpSent(true);
        } else {
          await verifyOtp(email, otp);
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setError("");
    setLoading(true);
    try {
      // In a real app, this would trigger the provider's OAuth flow
      // For this demo, we'll mock it by sending a fake token
      await socialAuth(provider, "mock_token_" + Date.now(), `${provider}_user@example.com`, `${provider} User`);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Social login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome back to your English journey
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Continue where you left off. Your AI conversation partner is ready to practice.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[hsl(var(--background))] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">SpeakUp</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Sign in</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            Access your account using your preferred method.
          </p>

          <div className="flex gap-2 p-1 bg-[hsl(var(--muted))] rounded-xl mb-8">
            <button
              onClick={() => { setLoginMethod("password"); setOtpSent(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "password" ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMethod("otp")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                loginMethod === "otp" ? "bg-[hsl(var(--background))] shadow-sm" : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              Email OTP
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={otpSent}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all placeholder:text-[hsl(var(--muted-foreground))]"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loginMethod === "password" ? (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required={loginMethod === "password"}
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all placeholder:text-[hsl(var(--muted-foreground))]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                otpSent && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <label className="text-sm font-medium mb-2 block">Verification Code</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit code"
                        maxLength={6}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all placeholder:text-[hsl(var(--muted-foreground))]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="mt-2 text-xs text-violet-400 hover:underline"
                    >
                      Change email
                    </button>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loginMethod === "otp" && !otpSent ? "Sending OTP..." : "Signing in..."}
                </>
              ) : (
                loginMethod === "otp" && !otpSent ? "Send OTP" : "Sign In"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--border))]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--background))] px-2 text-[hsl(var(--muted-foreground))]">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSocialAuth("google")}
              className="flex items-center justify-center py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--border))] transition-colors"
            >
              <Globe className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={() => handleSocialAuth("facebook")}
              className="flex items-center justify-center py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--border))] transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => handleSocialAuth("linkedin")}
              className="flex items-center justify-center py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--border))] transition-colors"
            >
              <Briefcase className="w-5 h-5 text-blue-700" />
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
