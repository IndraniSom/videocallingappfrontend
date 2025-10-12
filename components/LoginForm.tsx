"use client"
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface LoginFormProps {
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

const LoginForm = ({
  heading,
  logo = {
    url: "/",
    src: "https://res.cloudinary.com/dhjzu51mb/image/upload/v1760190820/dhrhtqixp5xhzdzw90dn.png",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  googleText = "Sign in with Google",
  signupText = "Login",
  loginText = "Don't have an account",
  loginUrl = "/signup",
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Login failed:', error);
      // Handle error (show error message to user)
    }
  };
  return (
    <section className=" w-full h-screen bg-white signup-background">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-white flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
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
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
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
                <Button type="button" className="w-full text-red-500 border-[1px] border-black rounded-md">
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
              Signup
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { LoginForm };
