export function Chip({ label, variant = 'default', onClose, onClick }) {
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium'
  
  const variantClasses = {
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-blue-200 text-blue-800',
    success: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-200 text-yellow-800',
    danger: 'bg-red-200 text-red-800',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`} onClick={onClick}>
      <span>{label}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 p-0.5 hover:bg-opacity-50 rounded-full transition-colors"
          aria-label="Remove chip"
        >
          ✕
        </button>
      )}
    </div>
  )
}
