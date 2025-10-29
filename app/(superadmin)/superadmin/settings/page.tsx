// Lokasi: frontend/app/(superadmin)/superadmin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { Settings as SettingsIcon, Globe, Wrench, Save, ShieldCheck, Mail, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

type PlatformSettings = {
  namaPlatform: string;
  domainUtama: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: "red" | "blue" | "green" | "amber" | "purple";
  allowNewTenant: boolean;
  requireApproval: boolean;
  enforce2FA: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  emailSender: string;
  emailHost: string;
};

const defaultSettings: PlatformSettings = {
  namaPlatform: "Sistem Koperasi ID",
  domainUtama: "https://sistemkoperasi.id",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "red",
  allowNewTenant: true,
  requireApproval: true,
  enforce2FA: false,
  maintenanceMode: false,
  maintenanceMessage: "Sedang pemeliharaan singkat. Mohon kembali beberapa saat lagi.",
  emailSender: "no-reply@sistemkoperasi.id",
  emailHost: "smtp.example.com",
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
);

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (val: boolean) => void; label: string; description?: string; }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-red-600" : "bg-gray-300"
        )}
      >
        <span
          className={clsx(
            "inline-block h-5 w-5 transform rounded-full bg-white transition",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

export default function SuperAdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      // Simulasi fetch pengaturan
      setSettings(defaultSettings);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof PlatformSettings) => (val: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Pengaturan platform disimpan (simulasi).");
    }, 800);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Skeleton className="h-6 w-56 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Skeleton className="h-6 w-60 mb-4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Skeleton className="h-6 w-56 mb-4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <SettingsIcon /> Pengaturan Platform
          </h1>
          <p className="text-gray-600 mt-1">Atur identitas, branding, autentikasi, dan mode pemeliharaan platform.</p>
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="mr-2" size={18} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom kiri: Form utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identitas */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Identitas Platform</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="namaPlatform">Nama Platform</label>
                <input id="namaPlatform" name="namaPlatform" value={settings.namaPlatform} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="domainUtama">Domain Utama</label>
                <input id="domainUtama" name="domainUtama" value={settings.domainUtama} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2" htmlFor="logoUrl"><ImageIcon size={16}/> URL Logo</label>
                <input id="logoUrl" name="logoUrl" value={settings.logoUrl} onChange={handleChange} placeholder="https://..." className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="faviconUrl">URL Favicon</label>
                <input id="faviconUrl" name="faviconUrl" value={settings.faviconUrl} onChange={handleChange} placeholder="https://..." className="w-full p-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Branding</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="primaryColor">Warna Utama</label>
                <select id="primaryColor" name="primaryColor" value={settings.primaryColor} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                  <option value="red">Merah</option>
                  <option value="blue">Biru</option>
                  <option value="green">Hijau</option>
                  <option value="amber">Amber</option>
                  <option value="purple">Ungu</option>
                </select>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-sm text-gray-600">Pratinjau:</span>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-8 h-8 rounded-full bg-red-600" aria-label="Merah" />
                  <span className="inline-block w-8 h-8 rounded-full bg-blue-600" aria-label="Biru" />
                  <span className="inline-block w-8 h-8 rounded-full bg-green-600" aria-label="Hijau" />
                  <span className="inline-block w-8 h-8 rounded-full bg-amber-500" aria-label="Amber" />
                  <span className="inline-block w-8 h-8 rounded-full bg-purple-600" aria-label="Ungu" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-6">
          {/* Maintenance */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Mode Pemeliharaan</h2>
            </div>
            <div className="space-y-4">
              <Toggle checked={settings.maintenanceMode} onChange={handleToggle("maintenanceMode")}
                label="Aktifkan Mode Pemeliharaan"
                description="Seluruh tenant akan melihat halaman pemeliharaan."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="maintenanceMessage">Pesan Pemeliharaan</label>
                <textarea id="maintenanceMessage" name="maintenanceMessage" rows={3} value={settings.maintenanceMessage} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Auth/Registrasi */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Autentikasi & Registrasi</h2>
            </div>
            <div className="space-y-4">
              <Toggle checked={settings.allowNewTenant} onChange={handleToggle("allowNewTenant")} label="Izinkan Pendaftaran Tenant Baru" />
              <Toggle checked={settings.requireApproval} onChange={handleToggle("requireApproval")} label="Butuh Persetujuan Super Admin" />
              <Toggle checked={settings.enforce2FA} onChange={handleToggle("enforce2FA")} label="Wajibkan 2FA untuk Admin" />
            </div>
          </div>

          {/* Email */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">Email Notifikasi</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emailSender">Email Pengirim</label>
                <input id="emailSender" name="emailSender" value={settings.emailSender} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emailHost">SMTP Host</label>
                <input id="emailHost" name="emailHost" value={settings.emailHost} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
