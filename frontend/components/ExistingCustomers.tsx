"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Customer {
  _id: string;
  name: string;
  logo?: string;
  link?: string;
  isActive: boolean;
}

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace("/api", "");

function LogoCard({ customer, idx }: { customer: Customer; idx: number }) {
  const hasLogo = customer.logo && customer.logo !== "no-photo.jpg";
  const Tag = (customer.link ? "a" : "div") as React.ElementType;
  const linkProps = customer.link
    ? { href: customer.link, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      key={idx}
      {...linkProps}
      className={`group flex-shrink-0 flex items-center justify-center w-36 h-16 transition-all duration-300 ${
        customer.link ? "cursor-pointer" : ""
      }`}
    >
      {hasLogo ? (
        <Image
          src={`${BASE_URL}/uploads/${customer.logo}`}
          alt={customer.name}
          width={120}
          height={50}
          className="object-contain max-h-12 group-hover:scale-110 transition-all duration-300"
          unoptimized
        />
      ) : (
        <span className="text-xs font-semibold text-slate-500 group-hover:text-white transition-colors text-center leading-tight px-1">
          {customer.name}
        </span>
      )}
    </Tag>
  );
}

export default function ExistingCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/existing-customers`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCustomers(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || customers.length === 0) return null;

  const third = Math.ceil(customers.length / 3);
  const row1 = customers.slice(0, third);
  const row2 = customers.slice(third, 2 * third);
  const row3 = customers.slice(2 * third);
  const doubled1 = [...row1, ...row1];
  const doubled2 = [...row2, ...row2];
  const doubled3 = [...row3, ...row3];

  return (
    <section className="pt-0 pb-16 relative overflow-hidden -mt-12">
      {/* Header */}
      <div className="text-center mb-8 px-4">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 bg-white/5 border-white/20 text-blue-400">
            Trusted By Industry Leaders
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-display font-black text-white mt-4 tracking-tight">
          Our{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Existing Customers
          </span>
        </h2>
      </div>

      {/* Row 1 — left */}
      <div
        className="relative mb-6 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
      >
        <div
          className="flex gap-8 w-max animate-marquee-left"
          style={{ animationDuration: `${Math.max(35, row1.length * 4)}s` }}
        >
          {doubled1.map((c, i) => <LogoCard key={`r1-${i}`} customer={c} idx={i} />)}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

      {/* Row 2 — right */}
      <div
        className="relative mb-6 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
      >
        <div
          className="flex gap-8 w-max animate-marquee-right"
          style={{ animationDuration: `${Math.max(40, row2.length * 4)}s` }}
        >
          {doubled2.map((c, i) => <LogoCard key={`r2-${i}`} customer={c} idx={i} />)}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

      {/* Row 3 — left */}
      <div
        className="relative overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
      >
         <div
          className="flex gap-8 w-max animate-marquee-left"
          style={{ animationDuration: `${Math.max(30, row3.length * 4)}s` }}
        >
          {doubled3.map((c, i) => <LogoCard key={`r3-${i}`} customer={c} idx={i} />)}
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right linear infinite;
        }
        .animate-marquee-left:hover,
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
