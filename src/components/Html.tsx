/**
 * Renders question HTML. Bank content is sanitised at import time
 * (scripts/import-quizzes.mjs) and AI content is escaped on the server.
 */
export function Html({ html, as: Tag = "div", className = "", style }: { html: string; as?: "div" | "span"; className?: string; style?: React.CSSProperties }) {
  return <Tag className={"qhtml " + className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
