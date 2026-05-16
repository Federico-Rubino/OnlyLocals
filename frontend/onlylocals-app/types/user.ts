export interface RegisterPayload {
  name: string;
  surname: string;
  birthDate: string; // DD/MM/YYYY from the form
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  // adjust to match your actual API response shape
  id: string;
  username: string;
  email: string;
  role: string;
}
