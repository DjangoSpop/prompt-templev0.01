const SunDisk = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <div 
    className={`inline-flex items-center justify-center rounded-full bg-sun text-white ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="text-xs">☀</div>
  </div>
);
