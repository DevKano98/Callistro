export default function Card({ children, className = '', hover = false }) {
  return (
    <div 
      className={`rounded-xl ${hover ? 'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]' : 'shadow-sm'} ${className}`}
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {children}
    </div>
  );
}