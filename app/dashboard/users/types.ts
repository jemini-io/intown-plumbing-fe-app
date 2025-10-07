export type Role = "USER" | "ADMIN";

export type UserImage = {
  id: string;
  url: string;
  publicId: string;
  uploadedAt: string | Date;
};

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image: UserImage | null; // antes: string | null
  enabled: boolean;
};
