import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  getIdToken,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "@/lib/firebase";
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

  const signInWithGoogle = async (payload?: {
    role?: "male" | "female";
    dateOfBirth?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  }) => {
    try {
      // Sign in with Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const accessToken = (result as any)?._tokenResponse?.oauthAccessToken as string | undefined;
      const idToken = await getIdToken(result.user);

      let people: any = null;
      if (accessToken) {
        try {
          const peopleRes = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=birthdays,genders",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (peopleRes.ok) {
            people = await peopleRes.json();
          }
        } catch (e) {
          // ignore People API failures
        }
      }

      const birthday = (() => {
        const b = people?.birthdays?.find((x: any) => x?.date)?.date;
        if (!b?.year || !b?.month || !b?.day) return undefined;
        const yyyy = String(b.year).padStart(4, "0");
        const mm = String(b.month).padStart(2, "0");
        const dd = String(b.day).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      })();

      const gender = (() => {
        const g = people?.genders?.find((x: any) => x?.value)?.value;
        if (!g) return undefined;
        const v = String(g).toLowerCase();
        if (v === "male" || v === "female") return v as "male" | "female";
        return undefined;
      })();
      
      let res: any;
      try {
        // Verify token with backend
        res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          idToken,
          role: payload?.role, // Only include role if provided (for new users)
          dateOfBirth: payload?.dateOfBirth ?? birthday,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          profilePicture: payload?.profilePicture,
        });
      } catch (apiErr: any) {
        const requiresGender = Boolean(apiErr?.response?.data?.requiresGender);
        if (requiresGender) {
          const currentUser = auth.currentUser;
          throw {
            requiresGender: true,
            userInfo: {
              name: currentUser?.displayName || "",
              email: currentUser?.email || "",
              profilePicture: currentUser?.photoURL || "",
              birthday,
              gender,
            },
          };
        }
        throw apiErr;
      }
      
      localStorage.setItem('token', res.data.idToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      return {
        user: res.data.user,
        token: res.data.idToken,
        isNewUser: res.data.isNewUser,
        birthday,
        gender,
        accessToken,
      };
    } catch (err: any) {
      console.error("Google sign-in error:", err.response?.data || err.message);
      throw err;
    }
  };

  const signInWithFacebook = async (payload?: {
    role?: "male" | "female";
    dateOfBirth?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  }) => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await getIdToken(result.user);

      let res: any;
      try {
        // Reuse backend Firebase token verification flow
        res = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          idToken,
          role: payload?.role,
          dateOfBirth: payload?.dateOfBirth,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          profilePicture: payload?.profilePicture,
        });
      } catch (apiErr: any) {
        const requiresGender = Boolean(apiErr?.response?.data?.requiresGender);
        if (requiresGender) {
          const currentUser = auth.currentUser;
          throw {
            requiresGender: true,
            userInfo: {
              name: currentUser?.displayName || "",
              email: currentUser?.email || "",
              profilePicture: currentUser?.photoURL || "",
            },
          };
        }
        throw apiErr;
      }

      localStorage.setItem('token', res.data.idToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      return {
        user: res.data.user,
        token: res.data.idToken,
        isNewUser: res.data.isNewUser,
      };
    } catch (err: any) {
      console.error("Facebook sign-in error:", err.response?.data || err.message);
      throw err;
    }
  };

  return { signup, login, signInWithGoogle, signInWithFacebook };
};
