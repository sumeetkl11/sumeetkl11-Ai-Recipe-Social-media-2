import { useState } from 'react';

const AVATAR_THEMES = [
  'linear-gradient(135deg, #fb7185, #f97316)',
  'linear-gradient(135deg, #f59e0b, #facc15)',
  'linear-gradient(135deg, #2dd4bf, #3b82f6)',
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)'
];

function getThemeIndex(seed = '') {
  return Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_THEMES.length;
}

export default function UserAvatar({
  name = 'User',
  src,
  alt,
  size = 48,
  className = '',
  textClassName = ''
}) {
  const [failedSource, setFailedSource] = useState(null);
  const displayName = name || 'User';
  const label = alt || displayName;
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
  const theme = AVATAR_THEMES[getThemeIndex(displayName)];
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  if (src && failedSource !== src) {
    return (
      <img
        src={src}
        alt={label}
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSource(src)}
        style={{ width: sizeValue, height: sizeValue, minWidth: sizeValue }}
      />
    );
  }

  return (
    <div
      aria-label={label}
      className={className}
      style={{
        width: sizeValue,
        height: sizeValue,
        minWidth: sizeValue,
        background: theme
      }}
    >
      <span className={textClassName}>{initial}</span>
    </div>
  );
}
