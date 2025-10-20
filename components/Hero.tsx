import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

// A list of sample image URLs for the demo
const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60",
  
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=60",
  
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60"
];


const AnimatedHeroDemo = () => {
  return (
    <AnimatedMarqueeHero
      tagline="Join over 100,000 happy creators"
      title={
        <>
          Random Videochat
          <br />
          with Pretty Girls
        </>
      }
      description="Find your perfect match today. Sign up now and start connecting with amazing people! Get your free account today."
      ctaText="Get Started"
      images={DEMO_IMAGES}
    />
  );
};

export default AnimatedHeroDemo;