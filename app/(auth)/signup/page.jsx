"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import GlobalApi from "@/app/api/_services/GlobalApi";

// Define Zod schema for validation
const childSchema = z.object({
  name: z.string().min(1, { message: "Child's name is required." }),
  gender: z.enum(["male", "female", "other"], { message: "Select a gender." }),
  age: z.any(),
  grade: z.string().min(1, { message: "Select a grade." }),
});

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z
      .string()
      .min(2, { message: "Username must be at least 2 characters." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Please confirm your password." }),
    mobile: z
      .string()
      .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits." }),
    children: z
      .array(childSchema)
      .min(1, { message: "At least one child is required." }),
    dob: z.any(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function Signup() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      children: [{ name: "", gender: "male", age: new Date(), grade: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded) {
          router.push("/");
        }
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, [router]);

  const onSubmit = async (data) => {
    try {
      const response = await GlobalApi.SignUpUser(data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        router.replace("/");
      }
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    }
  };

  const gradeOptions = [
    "Pre-School",
    "Nursery",
    "LKG (Lower Kindergarten)",
    "UKG (Upper Kindergarten)",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 text-gray-800 p-5">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-xl p-6 shadow-lg rounded-lg bg-white border border-slate-200">
        <h1 className="text-2xl font-semibold text-center mb-4">Sign Up</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Parent Details */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent&apos;s Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Children Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Children</h2>
              {fields.map((field, index) => (
                <div key={field.id} className="mb-4">
                  <FormField
                    control={form.control}
                    name={`children.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Child's Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`children.${index}.gender`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full border rounded p-2 bg-white"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`children.${index}.age`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <br />
                        {/* <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover> */}
                        <input
                          type="date"
                          value={form.value}
                          placeholder="Enter your Date of Birth"
                          onChange={field.onChange}
                          max={new Date().toISOString().split("T")[0]}
                          className="mt-1 block w-full min-w-72 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`children.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full border rounded p-2 bg-white"
                          >
                            <option value="" disabled>
                              Select Grade
                            </option>
                            {gradeOptions.map((grade) => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {index !== 0 && (
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="outline"
                      className="mt-2"
                    >
                      Remove Child
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
                  append({ name: "", gender: "male", age: new Date(), grade: "" })
                }
                className="mt-4"
              >
                Add Another Child
              </Button>
            </div>

            <Button type="submit" className="w-full bg-blue-600 text-white">
              Sign Up
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Signup;
