import { createContext } from "react";

export type AuthContextType = {
  token: string | null;
  user: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    name?: string
  ) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
