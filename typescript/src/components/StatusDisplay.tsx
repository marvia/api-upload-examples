interface StatusDisplayProps {
  status: string | null;
}

export default function StatusDisplay({ status }: StatusDisplayProps) {
  if (!status) return null;

  return (
    <div className="text-sm text-[#1B3C7F] mt-2 text-center">
      {status}
    </div>
  );
}
