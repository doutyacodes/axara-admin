"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlobalApi from "@/app/api/_services/GlobalApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockIcon, UserIcon, UserPlus, UserCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(100),
    // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, {
    //   message: "Password must contain at least one uppercase letter, one lowercase letter, and one number."
    // }),
  confirmPassword: z.string().min(6, { message: "Confirm password is required." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function Signup() {
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: ""
    },
  });

  const router = useRouter();

  useEffect(() => {
    router.push('/login')
  }, [])

  return null

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = data;
      
      // Send signup request
      const response = await GlobalApi.SignupAdmin(signupData);
      
      if(response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success("Account created successfully!");
        router.replace("/news");
      }
    } catch (error) {
      console.log(error)
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 text-gray-800 p-5">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-800 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">Create Account</h1>
          <p className="text-center text-red-100 mt-2">Join as an administrator</p>
        </div>
        
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Enter your full name" 
                        className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-red-800 focus:ring-1 focus:ring-red-800" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )} />

              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Choose a unique username" 
                        className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-red-800 focus:ring-1 focus:ring-red-800" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Create a strong password" 
                        className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-red-800 focus:ring-1 focus:ring-red-800" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-red-800 focus:ring-1 focus:ring-red-800" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )} />
              
              <Button 
                type="submit" 
                className="w-full bg-red-800 hover:bg-red-900 text-white py-6 font-medium text-lg rounded-lg transition-all duration-200"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-red-800 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;