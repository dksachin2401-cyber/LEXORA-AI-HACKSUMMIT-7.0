export function isPasswordStrong(pwd: string): boolean {
  if (pwd.length < 8) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return false;
  return true;
}
