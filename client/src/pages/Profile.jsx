import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useCurrentUser, useUpdateProfile } from "../features/auth/useAuth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  avatarUrl: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
});

const Profile = () => {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", avatarUrl: user?.avatarUrl || "" },
  });

  const onSubmit = (data) => updateProfile.mutate(data);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold mb-6">Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-paper-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-paper-soft flex items-center justify-center">
              <UserCircleIcon className="w-10 h-10 text-ink-muted" />
            </div>
          )}
          <div>
            <p className="font-bold">{user?.name}</p>
            <p className="text-sm text-ink-muted">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold mb-1">Full name</label>
            <input type="text" className="input-field" {...register("name")} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Avatar URL (optional)</label>
            <input type="text" className="input-field" placeholder="https://..." {...register("avatarUrl")} />
            {errors.avatarUrl && <p className="text-red-600 text-xs mt-1">{errors.avatarUrl.message}</p>}
          </div>

          <button type="submit" className="btn-accent w-full" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
