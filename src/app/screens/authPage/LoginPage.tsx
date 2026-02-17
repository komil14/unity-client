import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../services/authApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";

function errorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Login failed.";
  const anyErr = err as any;
  return anyErr?.data?.message || anyErr?.error || "Login failed.";
}

export default function LoginPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const [memberNick, setMemberNick] = useState("");
  const [memberType] = useState<"USER" | "ORG">("USER");
  const [memberPassword, setMemberPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Login</h1>
      <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
        Login to apply as a volunteer or create events as an organization.
      </div>

      <div style={{ marginTop: 14 }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError(null);
              try {
                await login({
                  memberNick: memberNick.trim(),
                  memberPassword,
                }).unwrap();
                navigate(memberType === "ORG" ? "/dashboard" : "/profile", { replace: true });
              } catch (err) {
                setFormError(errorMessage(err));
              }
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "var(--text-muted)",
              }}
            >
              Nick
            </label>
            <input
              value={memberNick}
              onChange={(e) => setMemberNick(e.target.value)}
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(16,185,129,0.35)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
              }}
              autoComplete="username"
            />

            <div style={{ height: 12 }} />

            <label
              style={{
                display: "block",
                marginBottom: 6,
                color: "var(--text-muted)",
              }}
            >
              Password
            </label>
            <input
              value={memberPassword}
              onChange={(e) => setMemberPassword(e.target.value)}
              type="password"
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(16,185,129,0.35)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
              }}
              autoComplete="current-password"
            />

            {formError ? (
              <div
                style={{
                  marginTop: 12,
                  color: "var(--danger)",
                  fontWeight: 600,
                }}
              >
                {formError}
              </div>
            ) : null}

            <button
              disabled={isLoading}
              type="submit"
              style={{
                marginTop: 14,
                width: "100%",
                height: 42,
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(16,185,129,0.35)",
                background: "rgba(16,185,129,0.16)",
                color: "var(--text-main)",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              {isLoading ? "Logging in…" : "Login"}
            </button>

            <div style={{ marginTop: 12, color: "var(--text-muted)" }}>
              Don’t have an account?{" "}
              <Link to="/signup" style={{ color: "var(--primary)" }}>
                Sign up
              </Link>
            </div>
          </form>
      </div>
    </div>
  );
}
