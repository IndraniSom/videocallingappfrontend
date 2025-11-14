"use client";

import { useState } from "react";

import { Signup1 } from "@/components/SignUpForm";
import Hero from "@/components/Hero";
import Abouts from "@/components/Abouts";
import FAQs from "@/components/faqs-component";
import FooterSection from "@/components/Footer";
import {Feature} from "@/components/Benefit";
import {FeatureSteps} from "@/components/Feature";
import Hero2 from "@/components/Hero2";
export default function HomePage() {
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(
    null
  );
  const features = [
  { 
    step: 'Step 1', 
    title: 'Make new friends from anywhere randomly',
    content: 'Connect with pretty girls worlwide through our random video chat platform.', 
    image: 'https://res.cloudinary.com/dhjzu51mb/image/upload/v1760274887/isklufenf2ut2o93nl9v.png' 
  },
  { 
    step: 'Step 2',
    title: 'Chat and find your soulmate',
    content: 'Engage in fun and meaningful conversations with randomly matched girls',
    image: 'https://res.cloudinary.com/dhjzu51mb/image/upload/v1760275279/ditnhw6tppszqdjbghtm.png'
  },
  { 
    step: 'Step 3',
    title: 'Engage in video calls and build connections',
    content: 'Enjoy seamless video calls with your matches and build lasting connections.',
    image: 'https://res.cloudinary.com/dhjzu51mb/image/upload/v1760275345/wg6nuzdlcz0scfejvwtl.png'
  },
]
  return (
    <div className="w-full  h-full bg-gradient-to-r from-purple-900 to-pink-900">
      <Hero2/>
      <Abouts/>
       <FeatureSteps 
        features={features}
        title="Features of the Platform"
        autoPlayInterval={3000}
        imageHeight="h-[500px]"
      />
  )
      <Feature/>
      <FAQs/>
      <FooterSection/>
      </div>
  );
}
