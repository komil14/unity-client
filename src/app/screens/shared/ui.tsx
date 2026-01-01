import React from "react";

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function imageUrlFromFilename(filename?: string): string | undefined {
  if (!filename) return undefined;
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return `/uploads/events/${filename}`;
}

export function uploadUrlFromFilename(
  folder: string,
  filename?: string
): string | undefined {
  if (!filename) return undefined;
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return `/uploads/${folder}/${filename}`;
}

export function clampText(text: string, max = 160): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ margin: 0, fontSize: 22, letterSpacing: 0.2 }}>{title}</h2>
      {description ? (
        <p
          style={{ marginTop: 8, marginBottom: 16, color: "var(--text-muted)" }}
        >
          {description}
        </p>
      ) : (
        <div style={{ height: 16 }} />
      )}
      {children}
    </section>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow)",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}
