import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success('Account created');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-paper-100">Sign up</h1>
      <p className="mb-6 label-mono text-paper-300/60">Join ConnectHub</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-paper-200">Full name</label>
          <input
            id="name"
            className="input-field"
            {...register('name', { required: 'Name is required', maxLength: 50 })}
          />
          {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="username" className="mb-1 block text-sm text-paper-200">Username</label>
          <input
            id="username"
            className="input-field"
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'At least 3 characters' },
              pattern: { value: /^[a-z0-9_.]+$/i, message: 'Letters, numbers, _ and . only' },
            })}
          />
          {errors.username && <p className="mt-1 text-xs text-danger-500">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-paper-200">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-paper-200">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
              pattern: { value: /\d/, message: 'Must include a number' },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm text-paper-200">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            className="input-field"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-paper-300/70">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-safelight-500 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};
