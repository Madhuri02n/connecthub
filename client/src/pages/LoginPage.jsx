import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-paper-100">Log in</h1>
      <p className="mb-6 label-mono text-paper-300/60">Welcome back to ConnectHub</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-paper-200">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input-field"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm text-paper-200">Password</label>
            <Link to="/forgot-password" className="text-xs text-safelight-500 hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input-field"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="mt-1 text-xs text-danger-500">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-paper-300/70">
        New to ConnectHub?{' '}
        <Link to="/register" className="font-semibold text-safelight-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};
