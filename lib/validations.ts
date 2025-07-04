import { z } from "zod";

// PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .refine((val) => /^\d+$/.test(val), "Phone number must contain only digits"),
  panNumber: z.string()
    .length(10, "PAN number must be exactly 10 characters")
    .regex(panRegex, "PAN format must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)")
    .transform((val) => val.toUpperCase()),
});

export const updateUserSchema = userSchema.extend({
  id: z.string().min(1, "User ID is required"),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;