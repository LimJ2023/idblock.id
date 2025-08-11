import { useEffect, useState } from "react";

interface TransactionIndicatorProps {
  /** 표시등이 활성화되어 점멸할지 여부 */
  isActive: boolean;
  /** 표시등 크기 (px) */
  size?: number;
}

const TransactionIndicator = ({ 
  isActive, 
  size = 12 
}: TransactionIndicatorProps) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsBlinking(true);
    } else {
      setIsBlinking(false);
    }
  }, [isActive]);

  return (
    <div className="flex justify-center mt-1 mb-4 ml-2">
      <div 
        className={`rounded-full transition-all duration-300 ${
          isBlinking 
            ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" 
            : "bg-gray-300"
        }`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          // 점멸할 때 더 밝은 그림자 효과
          boxShadow: isBlinking 
            ? `0 0 ${size/2}px rgba(34, 197, 94, 0.6), 0 0 ${size}px rgba(34, 197, 94, 0.3)` 
            : 'none'
        }}
      />
    </div>
  );
};

export { TransactionIndicator };