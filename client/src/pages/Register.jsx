import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useRegister } from "../features/auth/useAuth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Register = () => {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data) => registerUser.mutate(data);

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
          <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
          <p className="text-ink-muted mb-6 text-sm">Start understanding your documents in seconds.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1">Full name</label>
              <input type="text" className="input-field" placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input type="password" className="input-field" placeholder="At least 6 characters" {...register("password")} />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-accent w-full" disabled={registerUser.isPending}>
              {registerUser.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-ink-muted text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-ink underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
