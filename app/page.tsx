"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Signup1 } from "@/components/SignUpForm";
import Hero from "@/components/Hero";
import Abouts from "@/components/Abouts";
import FAQs from "@/components/faqs-component";
import FooterSection from "@/components/Footer";
import {Feature} from "@/components/Benefit";
import {FeatureSteps} from "@/components/Feature";
import Hero2 from "@/components/Hero2";
export default function HomePage() {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(
    null
  );
  const features = [
  { 
    step: t('step_1'), 
    title: t('feature_1_title'),
    content: t('feature_1_content'), 
    image: 'https://res.cloudinary.com/dhjzu51mb/image/upload/v1760274887/isklufenf2ut2o93nl9v.png' 
  },
  { 
    step: t('step_2'),
    title: t('feature_2_title'),
    content: t('feature_2_content'),
    image: 'https://res.cloudinary.com/dhjzu51mb/image/upload/v1760275279/ditnhw6tppszqdjbghtm.png'
  },
  { 
    step: t('step_3'),
    title: t('feature_3_title'),
    content: t('feature_3_content'),
    image: 'https://res.cloudinary.com/dhjzu51mb/image/upload/v1760275345/wg6nuzdlcz0scfejvwtl.png'
  },
]
  return (
    <div className="w-full  h-full bg-[#5940df]">
      <Hero2/>
      <Abouts/>
       <FeatureSteps 
        features={features}
        title={t('features_of_platform')}
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
