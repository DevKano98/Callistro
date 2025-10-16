export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-lg border border-surface-light ${className}`}>
      {children}
    </div>
  );
}