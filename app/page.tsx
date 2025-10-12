"use client";

import { useState } from "react";

import { Signup1 } from "@/components/SignUpForm";
import Hero from "@/components/Hero";
import Abouts from "@/components/Abouts";
import FAQs from "@/components/faqs-component";

export default function HomePage() {
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(
    null
  );

  return (
    <div className="w-full bg-white h-full ">
      <Hero/>
      <Abouts/>
      <FAQs/>
      </div>
  );
}
