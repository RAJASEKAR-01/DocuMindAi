import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useLogin } from "../features/auth/useAuth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data) => login.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-accent" />
          </span>
          <span className="text-xl font-extrabold">
            DocuMind <span className="text-accent-dark">AI</span>
          </span>
        </div>

        <div className="card">
          <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
          <p className="text-ink-muted mb-6 text-sm">Log in to analyze your documents.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-accent w-full" disabled={login.isPending}>
              {login.isPending ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-ink-muted text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-ink underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
