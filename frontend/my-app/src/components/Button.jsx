export default function Button({ children, onClick, type, variant = 'primary', className = '', disabled = false }) {
  const base = 'px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary hover:bg-blue-600 text-white',
    secondary: 'bg-surface-light hover:bg-surface text-white border border-surface-light',
    outline: 'border border-surface-light text-white hover:bg-surface-light',
    success: 'bg-success hover:bg-green-600 text-white',
    danger: 'bg-danger hover:bg-red-600 text-white',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}