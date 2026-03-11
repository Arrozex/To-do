import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  // Techy shapes (skewed) and neon borders
  const baseStyles = "relative px-6 py-3 font-tech font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 clip-path-polygon disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  // Using clip-path for angled corners
  const clipPathStyle = {
    clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
  };

  const variants = {
    primary: "bg-cyan-600/20 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:border-cyan-300",
    secondary: "bg-slate-800/50 border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-400",
    danger: "bg-red-900/20 border border-red-500 text-red-400 hover:bg-red-800/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]",
    ghost: "text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={variant !== 'ghost' ? clipPathStyle : undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Glitch/Scanline effect overlay on hover could go here, keeping simple for now */}
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      ) : children}
      
      {/* Corner decorations for primary */}
      {variant === 'primary' && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-200"></span>
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-200"></span>
        </>
      )}
    </button>
  );
};