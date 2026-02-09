"use client";
import clsx from "clsx";

// Glass Card Component
export function Card({ children, className, onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={clsx("glass-card p-5 transition-all duration-300", className, onClick && "cursor-pointer")}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right, icon }: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <div className="section-title">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </div>
        {subtitle && <div className="section-subtitle">{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("", className)}>{children}</div>;
}

// Badge Component
export function Badge({ tone, children, size = "md" }: {
  tone: "green" | "yellow" | "red" | "gray";
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };
  return (
    <span className={clsx(
      "rounded-full font-semibold inline-flex items-center gap-1.5",
      sizeClasses[size],
      tone === "green" && "badge-green",
      tone === "yellow" && "badge-yellow",
      tone === "red" && "badge-red",
      tone === "gray" && "bg-zinc-800 text-zinc-400 border border-zinc-700"
    )}>
      {children}
    </span>
  );
}

// Toggle Component
export function Toggle({ checked, onChange, labelLeft, labelRight }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelLeft?: string;
  labelRight?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {labelLeft && (
        <span className={clsx(
          "transition-colors",
          !checked ? "text-white font-medium" : "text-zinc-500"
        )}>{labelLeft}</span>
      )}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative w-12 h-6 rounded-full transition-all duration-300",
          checked
            ? "bg-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            : "bg-zinc-700"
        )}
      >
        <span className={clsx(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md",
          checked ? "left-7" : "left-1"
        )} />
      </button>
      {labelRight && (
        <span className={clsx(
          "transition-colors",
          checked ? "text-white font-medium" : "text-zinc-500"
        )}>{labelRight}</span>
      )}
    </div>
  );
}

// Stat Card Component
export function StatCard({ icon, label, value, subValue, tone, description, className }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  tone?: "green" | "yellow" | "red" | "neutral";
  description?: string;
  className?: string;
}) {
  const toneClasses = {
    green: "border-l-4 border-l-green-500",
    yellow: "border-l-4 border-l-yellow-500",
    red: "border-l-4 border-l-red-500",
    neutral: ""
  };

  return (
    <Card className={clsx("animate-fade-in", tone && toneClasses[tone], className)}>
      <div className="flex items-start gap-4">
        <div className="text-3xl flex items-center justify-center w-10 h-10">{icon}</div>
        <div className="flex-1">
          <div className="text-zinc-400 text-sm font-medium">{label}</div>
          <div className={clsx(
            "text-3xl font-bold mt-1 animate-score",
            tone === "green" && "text-green-400",
            tone === "yellow" && "text-yellow-400",
            tone === "red" && "text-red-400",
            !tone && "text-white"
          )}>
            {value}
          </div>
          {subValue && <div className="text-zinc-500 text-sm mt-1">{subValue}</div>}
          {description && (
            <div className="text-zinc-400 text-xs mt-2 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Progress Bar Component
export function ProgressBar({ value, max = 100, showLabel = true, tone }: {
  value: number;
  max?: number;
  showLabel?: boolean;
  tone?: "green" | "yellow" | "red";
}) {
  const percent = Math.min(100, (value / max) * 100);
  const toneColor = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };

  return (
    <div className="w-full">
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-700 ease-out",
            tone ? toneColor[tone] : "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-xs text-zinc-500 mt-1">{percent.toFixed(0)}%</div>
      )}
    </div>
  );
}

// Empty State Component
export function EmptyState({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 px-8">
      <div className="text-6xl mb-4">{icon}</div>
      <div className="text-xl font-semibold text-white mb-2">{title}</div>
      <div className="text-zinc-400 max-w-md mx-auto">{description}</div>
    </div>
  );
}
