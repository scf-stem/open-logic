"use client";

type LogoutButtonProps = {
  label: string;
};

export function LogoutButton({ label }: LogoutButtonProps) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button className="btn btn-ghost" onClick={() => void handleLogout()} type="button">
      {label}
    </button>
  );
}
