import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormInput({ label, error, className = '', ...props }: FormInputProps) {
  return (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-wide text-ink/60 mb-2">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm 
        focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30
        placeholder:text-ink/30 text-ink/80
        ${error ? 'border-red-300' : 'border-ink/10'}
        ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}