"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Phone,
  CreditCard,
  Save,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { userSchema, UserFormData } from "@/lib/validations";
import { User as UserType } from "@/types/user";
import { toast } from "sonner";

interface UserFormProps {
  user?: UserType;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [showPan, setShowPan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          panNumber: user.panNumber,
        }
      : undefined,
  });

  const watchedValues = watch();

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (user) {
        //await updateUser(user.id, { ...data, id: user.id });
        toast.success("User updated successfully!", {
          description: `${data.firstName} ${data.lastName} has been updated.`,
        });
      } else {
        //await createUser(data);
        toast.success("User created successfully!", {
          description: `${data.firstName} ${data.lastName} has been added.`,
        });
      }

      reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error?.response?.data?.error || "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      id: "firstName",
      label: "First Name",
      icon: User,
      placeholder: "Enter first name",
      type: "text",
    },
    {
      id: "lastName",
      label: "Last Name",
      icon: User,
      placeholder: "Enter last name",
      type: "text",
    },
    {
      id: "email",
      label: "Email Address",
      icon: Mail,
      placeholder: "Enter email address",
      type: "email",
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      icon: Phone,
      placeholder: "Enter 10-digit phone number",
      type: "tel",
      maxLength: 10,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {user ? "Edit User Profile" : "Create New User"}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {user
                  ? "Update user information and settings"
                  : "Add a new user to the system with secure data handling"}
              </p>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="space-y-3"
                  >
                    <Label htmlFor={field.id} className="text-sm font-medium flex items-center gap-2">
                      <field.icon className="h-4 w-4 text-muted-foreground" />
                      {field.label} *
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.id}
                        type={field.type}
                        maxLength={field.maxLength}
                        {...register(field.id as keyof UserFormData)}
                        placeholder={field.placeholder}
                        className={`input-focus transition-all duration-200 ${
                          errors[field.id as keyof UserFormData]
                            ? "border-red-500 focus:border-red-500"
                            : "focus:border-primary"
                        }`}
                      />
                      {watchedValues[field.id as keyof UserFormData] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </motion.div>
                      )}
                    </div>
                    {errors[field.id as keyof UserFormData] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        {errors[field.id as keyof UserFormData]?.message}
                      </motion.p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* PAN Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Security Information</h3>
              </div>

              <div className="space-y-3">
                <Label htmlFor="panNumber" className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  PAN Number *
                </Label>
                <div className="relative">
                  <Input
                    id="panNumber"
                    placeholder="Enter PAN number (e.g., ABCDE1234F)"
                    maxLength={10}
                    style={{ fontFamily: "monospace" }}
                    type={showPan ? "text" : "password"}
                    className={`input-focus pr-12 transition-all duration-200 ${
                      errors.panNumber ? "border-red-500 focus:border-red-500" : "focus:border-primary"
                    }`}
                    {...register("panNumber")}
                    onChange={(e) => setValue("panNumber", e.target.value.toUpperCase())}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                    onClick={() => setShowPan(!showPan)}
                  >
                    {showPan ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.panNumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    {errors.panNumber.message}
                  </motion.p>
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-3 w-3" />
                  Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-4 pt-6 border-t"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 button-glow h-12 text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {user ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {user ? "Update User" : "Create User"}
                  </>
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12 text-base font-medium"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
