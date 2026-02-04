import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignupMutation } from "../../services/authApi";
import { Card } from "../../../libs/shared/ui";
import type { MemberTypeFilter } from "../../../libs/types";

function errorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Signup failed.";
  const anyErr = err as any;
  return anyErr?.data?.message || anyErr?.error || "Signup failed.";
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();

  const [memberType, setMemberType] = useState<MemberTypeFilter>("USER");
  const [memberNick, setMemberNick] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Sign up</h1>
      <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
        Organizations will appear as <b>PENDING</b> until admin approval.
      </div>

      <div style={{ marginTop: 14 }}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            try {
              await signup({
                memberType,
                memberNick: memberNick.trim(),
                memberPhone: memberPhone.trim(),
                memberPassword,
              }).unwrap();

              // Redirect organizers to dashboard, volunteers to home
              navigate(memberType === "ORG" ? "/dashboard" : "/", {
                replace: true,
              });
            } catch (err) {
              setFormError(errorMessage(err));
            }
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: 6,
              color: "var(--text-muted)",
            }}
          >
            Account type
          </label>
          <select
            value={memberType}
            onChange={(e) => setMemberType(e.target.value as any)}
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
            }}
          >
            <option value="USER">Volunteer</option>
            <option value="ORG">Organization</option>
          </select>

          <div style={{ height: 12 }} />

          <label
            style={{
              display: "block",
              marginBottom: 6,
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
              border: "1px solid var(--border-color)",
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
            Phone
          </label>
          <input
            value={memberPhone}
            onChange={(e) => setMemberPhone(e.target.value)}
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
            }}
            autoComplete="tel"
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
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
            }}
            autoComplete="new-password"
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
            {isLoading ? "Creating…" : "Create account"}
          </button>

          <div style={{ marginTop: 12, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)" }}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
