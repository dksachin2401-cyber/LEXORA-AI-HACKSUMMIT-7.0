import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  const strengthLabel = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  const strengthColor = score <= 1 ? 'bg-rose-500' : score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-blue-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1.5 pt-1 text-xs">
      <div className="flex justify-between items-center text-[11px] font-semibold">
        <span className="text-slate-300">Password Strength:</span>
        <span className={score === 4 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{strengthLabel}</span>
      </div>

      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex gap-1 p-0.5">
        <div className={`h-full flex-1 rounded-full transition-all ${score >= 1 ? strengthColor : 'bg-transparent'}`} />
        <div className={`h-full flex-1 rounded-full transition-all ${score >= 2 ? strengthColor : 'bg-transparent'}`} />
        <div className={`h-full flex-1 rounded-full transition-all ${score >= 3 ? strengthColor : 'bg-transparent'}`} />
        <div className={`h-full flex-1 rounded-full transition-all ${score >= 4 ? strengthColor : 'bg-transparent'}`} />
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 pt-0.5">
        <span className={hasMinLength ? 'text-emerald-400 font-bold' : 'opacity-60'}>• 8+ characters</span>
        <span className={hasUppercase ? 'text-emerald-400 font-bold' : 'opacity-60'}>• Uppercase letter</span>
        <span className={hasNumber ? 'text-emerald-400 font-bold' : 'opacity-60'}>• Number (0-9)</span>
        <span className={hasSpecial ? 'text-emerald-400 font-bold' : 'opacity-60'}>• Special symbol</span>
      </div>
    </div>
  );
};
