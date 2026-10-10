"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { defaultVisible?: boolean };

/** A password field with an eye button at its end to show or hide what's typed. */
export function PasswordInput({ defaultVisible = false, style, className = "input", ...rest }: Props) {
  const [visible, setVisible] = useState(defaultVisible);
  // Vietnamese Telex/VNI turns w, r, s, f, j, x into ư or tone marks, so "qwqeqr" silently becomes "qưqẻ".
  const accented = typeof rest.value === "string" && /[^\x00-\x7F]/.test(rest.value);
  return (
    <span style={{ display: "block" }}>
    <span style={{ position: "relative", display: "block" }}>
      <input autoCapitalize="none" autoCorrect="off" spellCheck={false} {...rest} className={className} type={visible ? "text" : "password"} style={{ ...style, width: "100%", boxSizing: "border-box", paddingRight: 46 }} />
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
    {accented && (
      <span role="alert" style={{ display: "block", marginTop: 6, fontSize: 12, color: "var(--color-accent-800)" }}>
        Accented letters detected — Vietnamese typing (Telex/VNI) may be on. Turn it off and retype.
      </span>
    )}
    </span>
  );
}
