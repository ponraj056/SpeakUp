"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { Settings, User, Globe, Bell, Shield, Palette, Save, Loader2 } from "lucide-react";

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Turkish", "Russian"];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [nativeLang, setNativeLang] = useState(user?.nativeLanguage || "en");
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div><h1 className="text-2xl lg:text-3xl font-bold">Settings</h1><p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your account preferences</p></div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4">
        <div className="flex items-center gap-2 mb-2"><User className="w-5 h-5 text-violet-400" /><h2 className="font-semibold">Profile</h2></div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Display Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm opacity-50 cursor-not-allowed" />
        </div>
      </motion.div>

      {/* Language */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4">
        <div className="flex items-center gap-2 mb-2"><Globe className="w-5 h-5 text-cyan-400" /><h2 className="font-semibold">Language & Region</h2></div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Native Language</label>
          <select value={nativeLang} onChange={(e) => setNativeLang(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
            {LANGUAGES.map((l) => <option key={l} value={l.toLowerCase()}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Timezone</label>
          <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4">
        <div className="flex items-center gap-2 mb-2"><Palette className="w-5 h-5 text-amber-400" /><h2 className="font-semibold">Preferences</h2></div>
        <div className="flex items-center justify-between">
          <div><span className="text-sm font-medium">Dark Mode</span><p className="text-xs text-[hsl(var(--muted-foreground))]">Use dark theme</p></div>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-violet-500" : "bg-[hsl(var(--muted))]"}`}><div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
        </div>
        <div className="flex items-center justify-between">
          <div><span className="text-sm font-medium">Push Notifications</span><p className="text-xs text-[hsl(var(--muted-foreground))]">Daily reminders & streak alerts</p></div>
          <button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-colors ${notifications ? "bg-violet-500" : "bg-[hsl(var(--muted))]"}`}><div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? "translate-x-5.5" : "translate-x-0.5"}`} /></button>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4">
        <div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-emerald-400" /><h2 className="font-semibold">Security</h2></div>
        <div className="flex items-center justify-between">
          <div><span className="text-sm font-medium">Two-Factor Authentication</span><p className="text-xs text-[hsl(var(--muted-foreground))]">{user?.twoFaEnabled ? "Enabled" : "Not enabled"}</p></div>
          <button className="px-4 py-2 rounded-lg text-xs font-medium bg-[hsl(var(--muted))] hover:bg-violet-500/10 hover:text-violet-400 transition-all">{user?.twoFaEnabled ? "Manage" : "Enable"}</button>
        </div>
        <button className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">Change Password</button>
      </motion.div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : saved ? <><Save className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Changes</>}
      </button>

      {/* Danger */}
      <div className="p-6 rounded-2xl border border-red-500/20 space-y-3">
        <h3 className="font-semibold text-red-400">Danger Zone</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Permanently delete your account and all data. This cannot be undone.</p>
        <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">Delete Account</button>
      </div>
    </div>
  );
}
