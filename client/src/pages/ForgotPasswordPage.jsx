import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="mb-2 font-display text-xl font-semibold text-paper-100">Check your inbox</h1>
        <p className="text-sm text-paper-300/70">
          If that email is registered, a reset link is on its way.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-safelight-500 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-paper-100">Reset your password</h1>
      <p className="mb-6 text-sm text-paper-300/70">
        Enter the email on your account and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-paper-200">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm text-paper-300/70 hover:underline">
        Back to log in
      </Link>
    </div>
  );
};
