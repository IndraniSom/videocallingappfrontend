export interface User {
  _id: string;
  email: string;
  role: "male" | "female";
  isVerified?: boolean;
  token?: string;
}
