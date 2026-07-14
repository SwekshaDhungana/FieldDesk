interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-[#DCEAF7] border-t-[#6699CC] rounded-full animate-spin" />
      <p className="mt-3 text-sm text-[#60798D]">{message}</p>
    </div>
  );
}
