export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  image: string | null;
};
