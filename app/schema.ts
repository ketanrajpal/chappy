import { z } from "zod";

export type User = {
  code: string;
  phone: string;
};

export type State = {
  success: boolean;
  user: User | undefined;
  error: {
    login: boolean;
    code: boolean;
  };
};

export const LoginSchema = z.object({
  code: z.string().min(2),
  phone: z.string().min(10),
});

export const initialState: State = {
  success: false,
  user: undefined,
  error: {
    login: false,
    code: false,
  },
};
