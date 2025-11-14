"use client"
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useAuth, SignupData } from "@/hooks/useAuth";
import { GenderSelectionModal } from "./GenderSelectionModal";
import { useRouter } from "next/navigation";

interface Signup1Props {
  heading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
}

const Signup1 = ({
  heading,
  logo = {
    url: "/",
    src: "https://res.cloudinary.com/dhjzu51mb/image/upload/v1760190820/dhrhtqixp5xhzdzw90dn.png",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  googleText = "Sign up with Google",
  signupText = "Create an account",
  loginText = "Already have an account?",
  loginUrl = "/login",
}: Signup1Props) => {
  const [showGenderModal, setShowGenderModal] = useState(true);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { signup, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setShowGenderModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const signupData: SignupData = {
        email,
        password,
        role: selectedGender!,
        firstName,
        lastName,
      };

      await signup(signupData);
      if (selectedGender === 'female') {
        router.push('/video-verification');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      // Handle error (show error message to user)
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedGender) {
      // Show gender modal if not selected
      setShowGenderModal(true);
      return;
    }
    try {
      const result = await signInWithGoogle(selectedGender);
      if (selectedGender === 'female') {
        router.push('/video-verification');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      // If backend says user needs gender, show modal (shouldn't happen since we check)
      if (error.response?.data?.requiresGender || 
          error.response?.data?.message?.includes('Gender') || 
          error.response?.data?.message?.includes('gender')) {
        setShowGenderModal(true);
      } else {
        console.error('Google sign-in failed:', error);
      }
    }
  };

  return (
    <section className=" w-full h-screen bg-gradient-to-r from-purple-900 to-pink-900 signup-background">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-gradient-to-r from-purple-900 to-pink-900 flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  height={40}
                  width={100}
                  className=" object-cover size-full "
                />
              </a>
            </div>
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          {showGenderModal && <GenderSelectionModal onSelect={handleGenderSelect} />}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="mt-2 w-full bg-red-700 hover:bg-red-600">
                  {signupText}
                </Button>
                <Button type="button" onClick={handleGoogleSignIn} className="w-full text-red-500 border-[1px] border-black rounded-md">
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </div>
            </div>
          </form>
          <div className=" flex justify-center gap-1 text-sm text-black">
            <p>{loginText}</p>
            <a
              href={loginUrl}
              className="text-primary font-medium hover:underline text-red-500"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Signup1 };
