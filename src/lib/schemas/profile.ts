import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Ім'я не може бути порожнім").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Пароль має бути не менше 6 символів").optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
