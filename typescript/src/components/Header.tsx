import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-col items-center mb-8">
      <Image
        src="/logo.svg"
        alt="Marvia Logo"
        width={106}
        height={56}
        className="mb-2"
      />
      <p className="text-base text-gray-500">
        Upload files securely via the Marvia API
      </p>
    </div>
  );
}
