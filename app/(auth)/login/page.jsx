// components/Login.js
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlobalApi from "@/app/api/_services/GlobalApi"; // Ensure this has the login request setup
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." })
});

export function Login() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      // Send login request
      const response = await GlobalApi.LoginUser(data); // Adjust to your login API call
      if(response.data.token) {
        localStorage.setItem('token', response.data.token); // Store token
        router.replace("/"); // Redirect to home or another protected page
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 text-gray-800 p-5">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-xl p-6 shadow-lg rounded-lg bg-white border border-slate-200">
        <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-[#1e5f9f] text-white">
              Login
            </Button>
          </form>
        </Form>
        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-[#1e5f9f] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
