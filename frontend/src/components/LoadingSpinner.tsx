interface LoadingSpinnerProps {
  label?: string;
}

function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{label}</span>
    </span>
  );
}

export default LoadingSpinner;
