import {
  ButtonHTMLAttributes,
  ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  spinCount?: number;
  onSpinCountChange?: (count: number) => void;
  customText?: string;
  showIcon?: boolean;
  icon?: ReactNode;
}

export default function Button({
  children,
  className = "",
  spinCount = 1,
  onSpinCountChange,
  onClick,
  customText,
  showIcon = true,
  icon,
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [startX, setStartX] = useState(0);
  const [lastUpdateX, setLastUpdateX] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragThreshold = 10; // Minimum pixels to drag before incrementing/decrementing
  const minCount = 0;
  const maxCount = 10;

  const updateCount = useCallback(
    (delta: number) => {
      if (!onSpinCountChange) return;
      setLastUpdateX((prevX) => {
        const newCount = Math.max(
          minCount,
          Math.min(maxCount, spinCount + delta)
        );
        if (newCount !== spinCount) {
          onSpinCountChange(newCount);
        }
        return prevX;
      });
    },
    [onSpinCountChange, spinCount, minCount, maxCount]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (props.disabled) return;
    setIsPressed(true);
    setHasDragged(false);
    const x = e.clientX;
    setStartX(x);
    setLastUpdateX(x);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPressed || props.disabled) return;

      const currentX = e.clientX;
      setLastUpdateX((prevX) => {
        const deltaX = currentX - prevX;

        if (Math.abs(deltaX) >= dragThreshold) {
          setHasDragged(true);
          if (deltaX > 0) {
            // Dragging right - increment
            const newCount = Math.max(
              minCount,
              Math.min(maxCount, spinCount + 1)
            );
            if (newCount !== spinCount && onSpinCountChange) {
              onSpinCountChange(newCount);
            }
          } else {
            // Dragging left - decrement
            const newCount = Math.max(
              minCount,
              Math.min(maxCount, spinCount - 1)
            );
            if (newCount !== spinCount && onSpinCountChange) {
              onSpinCountChange(newCount);
            }
          }
          return currentX;
        }
        return prevX;
      });
    },
    [
      isPressed,
      props.disabled,
      dragThreshold,
      spinCount,
      minCount,
      maxCount,
      onSpinCountChange,
    ]
  );

  const handleMouseUp = useCallback((e?: MouseEvent) => {
    setIsPressed(false);
    setStartX(0);
    setLastUpdateX(0);
    setHasDragged(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (props.disabled) return;
    setIsPressed(true);
    setHasDragged(false);
    const touch = e.touches[0];
    const x = touch.clientX;
    setStartX(x);
    setLastUpdateX(x);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPressed || props.disabled) return;

      const touch = e.touches[0];
      const currentX = touch.clientX;
      setLastUpdateX((prevX) => {
        const deltaX = currentX - prevX;

        if (Math.abs(deltaX) >= dragThreshold) {
          setHasDragged(true);
          if (deltaX > 0) {
            // Dragging right - increment
            const newCount = Math.max(
              minCount,
              Math.min(maxCount, spinCount + 1)
            );
            if (newCount !== spinCount && onSpinCountChange) {
              onSpinCountChange(newCount);
            }
          } else {
            // Dragging left - decrement
            const newCount = Math.max(
              minCount,
              Math.min(maxCount, spinCount - 1)
            );
            if (newCount !== spinCount && onSpinCountChange) {
              onSpinCountChange(newCount);
            }
          }
          return currentX;
        }
        return prevX;
      });
    },
    [
      isPressed,
      props.disabled,
      dragThreshold,
      spinCount,
      minCount,
      maxCount,
      onSpinCountChange,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    setStartX(0);
    setLastUpdateX(0);
    setHasDragged(false);
  }, []);

  useEffect(() => {
    if (isPressed) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isPressed,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent onClick if user was dragging
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`relative cursor-pointer outline-none transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed select-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      {...props}
    >
      {/* SVG Button Shape */}
      <svg
        width="195"
        height="68"
        viewBox="0 0 195 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M194.144 50.5302L172.387 67.5303L21.4608 67.5303L0.143556 52.5303"
          stroke="white"
          stroke-width="0.5"
        />
        <path
          d="M168.144 1.53027H24.6436L2.14355 19.0303V43.5303L24.6436 60.5303H168.144L189.644 43.5303V19.0303L168.144 1.53027Z"
          fill="white"
          stroke="white"
        />
        <path
          d="M67.1436 62.5303L72.1436 57.5303H126.644L132.144 63.0303"
          stroke="#22232D"
          stroke-width="2"
        />
        <path
          d="M130.144 1.03027L125.144 6.03027L70.6436 6.03027L65.1436 0.530268"
          stroke="#22232D"
          stroke-width="2"
        />
      </svg>

      {/* Button Content */}
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        <span className="text-[#2a2a2a] text-2xl font-bold tracking-tight font-gemunu-libre">
          {customText || `SPIN ${spinCount}`}
        </span>
        {showIcon &&
          (icon || (
            <img
              src="/usdc.svg"
              alt="USDC"
              className="w-5 h-5 flex-shrink-0"
              draggable={false}
            />
          ))}
      </div>

      {children}
    </button>
  );
}
