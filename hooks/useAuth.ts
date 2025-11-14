import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  getIdToken,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
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
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      // Get Firebase ID token
      const idToken = await getIdToken(userCredential.user);
      
      // Register user in backend database
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        idToken,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      localStorage.setItem('token', res.data.idToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      return { user: res.data.user, token: res.data.idToken };
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await getIdToken(userCredential.user);
      
      // Verify token with backend
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        idToken
      });
      
      localStorage.setItem('token', res.data.idToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      return { user: res.data.user, token: res.data.idToken };
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  const signInWithGoogle = async (role?: "male" | "female") => {
    try {
      // Sign in with Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await getIdToken(result.user);
      
      // Verify token with backend
      const res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        idToken,
        role // Only include role if provided (for new users)
      });
      
      localStorage.setItem('token', res.data.idToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      return { user: res.data.user, token: res.data.idToken, isNewUser: res.data.isNewUser };
    } catch (err: any) {
      console.error("Google sign-in error:", err.response?.data || err.message);
      throw err;
    }
  };

  return { signup, login, signInWithGoogle };
};
