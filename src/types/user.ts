export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}
