export type UserRole = "child" | "parent";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
}
