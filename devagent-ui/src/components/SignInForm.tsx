"use client";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function SignInForm() {
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;

          const endpoint = flow === "signIn" ? "/api/v1/auth/login" : "/api/v1/auth/register";
          
          try {
            const response = await axios.post(endpoint, { email, password });
            
            // Store token and redirect on success
            if (response.data.access_token) {
              localStorage.setItem("authToken", response.data.access_token);
              toast.success(flow === "signIn" ? "Signed in successfully!" : "Signed up successfully!");
              navigate("/dashboard");
            } else {
              toast.error("Login failed: No token received.");
            }

          } catch (error: any) {
            let toastTitle = error.response?.data?.detail || 
              (flow === "signIn" 
                ? "Could not sign in. Please check your credentials." 
                : "Could not sign up. Please try again.");
            toast.error(toastTitle);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      {/* <button className="auth-button" onClick={() => void signIn("anonymous")}>
        Sign in anonymously
      </button> */}
    </div>
  );
}
