"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { defaultVisible?: boolean };

/** A password field with an eye button at its end to show or hide what's typed. */
export function PasswordInput({ defaultVisible = false, style, className = "input", ...rest }: Props) {
  const [visible, setVisible] = useState(defaultVisible);
  return (
    <span style={{ position: "relative", display: "block" }}>
      <input {...rest} className={className} type={visible ? "text" : "password"} style={{ ...style, width: "100%", boxSizing: "border-box", paddingRight: 46 }} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 999, border: "none", background: "transparent", color: "var(--color-neutral-700)", cursor: "pointer", display: "grid", placeItems: "center" }}
      >
        {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </span>
  );
}
