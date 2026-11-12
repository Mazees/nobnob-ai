const buttonStyles = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-border bg-surface text-foreground hover:bg-accent",
};

const statuses = {
  draft: { label: "Draft", color: "bg-lavender-soft text-foreground" },
  scheduled: { label: "Terjadwal", color: "bg-warning-soft text-warning" },
  uploaded: { label: "Sudah Upload", color: "bg-success-soft text-success" },
};

export function Button({ children, variant = "primary", type = "button", ...props }) {
  return (
    <button type={type} className={`rounded-control px-4 py-2 text-sm font-semibold disabled:opacity-50 ${buttonStyles[variant]}`} {...props}>
      {children}
    </button>
  );
}

export function TextInput({ label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className="w-full rounded-control border border-border bg-surface px-3 py-2" {...props} />
    </label>
  );
}

export function StatusBadge({ status }) {
  const item = statuses[status];
  if (!item) return null;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}>{item.label}</span>;
}
