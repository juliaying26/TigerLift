export default function Pill({ children, className }) {
  return (
    <div className={`px-3 py-1 bg-neutral-300 rounded-full ${className}`}>
      {children}
    </div>
  );
}
