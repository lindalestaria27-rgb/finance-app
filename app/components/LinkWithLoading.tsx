"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LinkWithLoading({ href, children }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(href);
    }, 300);
  };

  return (
    <button onClick={handleClick} className="text-[#0B1F3A] font-medium">
      {loading ? "Loading..." : children}
    </button>
  );
}