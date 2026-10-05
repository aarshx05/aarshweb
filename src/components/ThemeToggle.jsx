import { Moon, Sun } from './Icons'

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={onToggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <span className="theme-toggle-icon" data-theme-icon={theme}>
        <Sun className="ti-sun" width={16} height={16} />
        <Moon className="ti-moon" width={16} height={16} />
      </span>
    </button>
  )
}
