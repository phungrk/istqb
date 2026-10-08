import { Check, ChevronDown, ChevronRight, Clock, Mail, Send, Sparkles, X, type LucideIcon, type LucideProps } from "lucide-react";

/** Lucide icons at the design system's stroke width of 2.75. */
const themed = (Icon: LucideIcon, defaultSize = 16) =>
  function ThemedIcon({ size = defaultSize, strokeWidth = 2.75, ...rest }: LucideProps) {
    return <Icon size={size} strokeWidth={strokeWidth} {...rest} />;
  };

export const MailIcon = themed(Mail);
export const ChevronDownIcon = themed(ChevronDown, 14);
export const ChevronRightIcon = themed(ChevronRight, 14);
export const CheckIcon = themed(Check, 14);
export const XIcon = themed(X, 14);
export const ClockIcon = themed(Clock);
export const SparklesIcon = themed(Sparkles, 15);
export const SendIcon = themed(Send, 17);
