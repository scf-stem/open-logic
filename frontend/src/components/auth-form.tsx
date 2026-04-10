"use client";

import Image from "next/image";
import { useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  copy: {
    title: string;
    subtitle: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    captchaLabel?: string;
    captchaPlaceholder?: string;
    submit: string;
    hint?: string;
  };
};

export function AuthForm({ mode, copy }: AuthFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaUrl, setCaptchaUrl] = useState(`/api/auth/captcha?t=${Date.now()}`);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setSuccess("");

    const payload =
      mode === "register"
        ? {
            username: String(formData.get("username") || ""),
            password: String(formData.get("password") || ""),
            captcha: String(formData.get("captcha") || ""),
          }
        : {
            username: String(formData.get("username") || ""),
            password: String(formData.get("password") || ""),
          };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Request failed");
      }

      setSuccess(result.message || "Success");
      if (mode === "login") {
        window.location.href = "/";
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      if (mode === "register") {
        setCaptchaUrl(`/api/auth/captcha?t=${Date.now()}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <form
        action={(formData) => {
          void onSubmit(formData);
        }}
        className="auth-form"
      >
        <label className="field">
          <span>{copy.usernameLabel}</span>
          <input
            name="username"
            placeholder={copy.usernamePlaceholder}
            required
            type="text"
          />
        </label>

        <label className="field">
          <span>{copy.passwordLabel}</span>
          <input
            name="password"
            placeholder={copy.passwordPlaceholder}
            required
            type="password"
          />
        </label>

        {mode === "register" ? (
          <div className="captcha-row">
            <label className="field field-grow">
              <span>{copy.captchaLabel}</span>
              <input
                name="captcha"
                placeholder={copy.captchaPlaceholder}
                required
                type="text"
              />
            </label>
            <Image
              alt="captcha"
              className="captcha-image"
              height={40}
              onClick={() => setCaptchaUrl(`/api/auth/captcha?t=${Date.now()}`)}
              src={captchaUrl}
              unoptimized
              width={120}
            />
          </div>
        ) : null}

        {copy.hint ? <p className="field-hint">{copy.hint}</p> : null}

        {error ? <p className="message message-error">{error}</p> : null}
        {success ? <p className="message message-success">{success}</p> : null}

        <button className="btn btn-primary btn-full" disabled={loading} type="submit">
          {loading ? "..." : copy.submit}
        </button>
      </form>
    </div>
  );
}
