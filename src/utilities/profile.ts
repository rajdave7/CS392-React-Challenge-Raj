import type { User } from "firebase/auth";
import { useAuthState, useDataQuery } from "./firebase";


export const useProfile = (): [{ user: User | null; isAdmin: boolean }, boolean, Error | undefined] => {
  const { user } = useAuthState();
  const [adminVal, isLoading, error] = useDataQuery(`/admins/${user?.uid ?? "guest"}`);

  const isAdmin = !!adminVal;

  return [{ user: user ?? null, isAdmin }, isLoading, error as Error | undefined];
};
