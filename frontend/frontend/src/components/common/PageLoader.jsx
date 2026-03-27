const DEFAULT_MIN_HEIGHT = "60vh";

export default function PageLoader({ minHeight = DEFAULT_MIN_HEIGHT }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center w-100 py-5"
      style={{ minHeight }}
    >
      <div className="spinner-border text-primary" role="status" aria-label="Loading page">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
