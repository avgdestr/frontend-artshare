export interface Artist {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profile_picture?: string;
  created_at: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  bio?: string;
  profile_picture?: File | null;
}
