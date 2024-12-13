export default function Pill({ children, className, email }) { 
  return (
    <div className={`px-3 py-1 bg-zinc-300 rounded-full ${className}`}>
      <span>{children}</span> {/* Text remains the default font size */}
    </div>
  );
}
