/** Main navigation, shared by the desktop header and the phone menu. */
export const NAV = [
  ["/mindmap", "Mindmap"],
  ["/tests", "Practice tests"],
  ["/dashboard", "Dashboard"],
] as const;
/** Shown only when pricing and the AI coach are enabled (ENABLE_PRO=1). */
export const PRO_NAV = [
  ["/coach", "AI Coach"],
  ["/pricing", "Pricing"],
] as const;
