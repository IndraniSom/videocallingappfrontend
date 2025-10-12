import axiosInstance from "@/lib/axiosInstance";

export interface SignupData {
  email: string;
  password: string;
  role: "male" | "female";
  firstName?: string;
  lastName?: string;
}

export const useAuth = () => {
  const signup = async (data: SignupData) => {
    try {
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { user: res.data.user, token: res.data.token };
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { user: res.data.user, token: res.data.token };
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  return { signup, login };
};
