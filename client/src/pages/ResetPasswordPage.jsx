import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async ({ password: newPassword }) => {
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset. You are now logged in.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-paper-100">Set a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-paper-200">New password</label>
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
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Saving...' : 'Reset password'}
        </button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm text-paper-300/70 hover:underline">
        Back to log in
      </Link>
    </div>
  );
};
