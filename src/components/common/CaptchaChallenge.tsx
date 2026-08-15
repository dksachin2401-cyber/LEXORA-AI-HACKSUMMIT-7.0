import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface CaptchaChallengeProps {
  onVerify: (isValid: boolean) => void;
}

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({ onVerify }) => {
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 15) + 3;
    const n2 = Math.floor(Math.random() * 12) + 2;
    setNum1(n1);
    setNum2(n2);
    setUserInput('');
    setIsCorrect(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    const expected = num1 + num2;
    const valid = parseInt(val, 10) === expected;
    setIsCorrect(valid);
    onVerify(valid);
  };

  return (
    <div className="p-3.5 bg-[#132240] border border-white/20 rounded-xl space-y-2 text-white">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-[#C9A24B] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
          Security CAPTCHA Verification:
        </span>
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-sm font-extrabold font-mono text-[#C9A24B] tracking-widest select-none shadow-inner">
          {num1} + {num2} = ?
        </div>
        <input
          type="number"
          value={userInput}
          onChange={handleChange}
          placeholder="Answer"
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
        />
      </div>

      {userInput && (
        <p className={`text-[11px] font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isCorrect ? '✓ Security CAPTCHA Verified' : '✕ Incorrect math answer'}
        </p>
      )}
    </div>
  );
};
