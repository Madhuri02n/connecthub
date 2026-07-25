import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export const EditProfilePage = () => {
  const { user, updateLocalUser } = useAuth();
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const data = await userService.updateProfile(values);
      updateLocalUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPicture(true);
    try {
      const data = await userService.updateProfilePicture(file);
      updateLocalUser(data.user);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploadingPicture(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-semibold">Edit profile</h1>

      <div className="contact-frame mb-6 flex flex-col items-center gap-3 p-6">
        <div className="relative">
          <Avatar user={user} size="xl" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPicture}
            aria-label="Change profile picture"
            className="absolute bottom-0 right-0 rounded-full bg-safelight-500 p-2 text-ink-950"
          >
            <Camera size={14} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handlePictureChange}
          className="hidden"
        />
        {isUploadingPicture && <p className="label-mono">Uploading...</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="contact-frame space-y-4 p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm">Name</label>
          <input id="name" className="input-field" {...register('name', { maxLength: 50 })} />
          {errors.name && <p className="mt-1 text-xs text-danger-500">Max 50 characters</p>}
        </div>

        <div>
          <label htmlFor="username" className="mb-1 block text-sm">Username</label>
          <input
            id="username"
            className="input-field"
            {...register('username', {
              minLength: 3,
              pattern: { value: /^[a-z0-9_.]+$/i, message: 'Letters, numbers, _ and . only' },
            })}
          />
          {errors.username && <p className="mt-1 text-xs text-danger-500">{errors.username.message || 'Invalid username'}</p>}
        </div>

        <div>
          <label htmlFor="bio" className="mb-1 block text-sm">Bio</label>
          <textarea id="bio" rows={3} maxLength={160} className="input-field resize-none" {...register('bio', { maxLength: 160 })} />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};
