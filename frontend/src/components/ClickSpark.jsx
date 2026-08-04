export default function ClickSpark({ children, className = '', disabled = false }) {
  return (
    <div className={`spark-wrap ${className}`.trim()}>
      {children}
    </div>
  );
}

