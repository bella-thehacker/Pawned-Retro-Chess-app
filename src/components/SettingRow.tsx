interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export default function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-[#8B6B4A]/20 last:border-0">
      <div className="flex-1 min-w-0">
        <label className="font-mono text-sm font-semibold text-[#2A1B15]">{label}</label>
        {description && (
          <p className="font-mono text-[11px] text-[#6B5B4A] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
