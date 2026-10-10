export default function Arrow({ direction = 'right', className = '' }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={direction === 'left' ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.3" /></svg>;
}
