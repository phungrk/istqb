/** Small inline spinner; inherits the text colour. */
export function Spinner({ label }: { label?: string }) {
  return <span className="spinner" role={label ? "status" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}

/** Full-page placeholder while a route's data loads from the server. */
export function PageLoading({ label = "Loading…", blocks = 3 }: { label?: string; blocks?: number }) {
  return (
    <section aria-busy="true" style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 28 }}>
      <span role="status" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--fs-14)", color: "var(--color-neutral-700)" }}>
        <span className="spinner" aria-hidden /> {label}
      </span>
      <span className="skeleton" style={{ height: 44, width: "min(420px, 70%)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {Array.from({ length: blocks }, (_, i) => <span key={i} className="skeleton" style={{ height: 180, borderRadius: 32 }} />)}
      </div>
    </section>
  );
}
