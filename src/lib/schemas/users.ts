import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Невірний формат електронної пошти"),
  name: z.string().min(1, "Ім'я обов'язкове"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
  role: z.enum(["admin", "moderator", "user"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "moderator", "user"]).optional(),
  password: z.string().min(6, "Пароль має бути не менше 6 символів").optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
