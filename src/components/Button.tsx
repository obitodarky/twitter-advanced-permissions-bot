import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    "cursor-pointer rounded-lg border-none bg-[linear-gradient(45deg,#999_5%,#fff_10%,#ccc_30%,#ddd_50%,#ccc_70%,#fff_80%,#999_95%)] px-4 py-1.5 text-base font-medium shadow-md outline-none transition-all duration-700 ease-in-out hover:-translate-y-1 w-fit px-10 py-3 font-semibold bg-gray-900 hover:bg-gray-800 rounded-[2rem] transition-all duration-200 ease-in-out min-h-12 inline-flex items-center justify-center border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-black";

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
