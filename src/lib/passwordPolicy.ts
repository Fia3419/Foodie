export const passwordPolicyMinimumLength = 12;

export const passwordPolicyRules = [
  "length",
  "uppercase",
  "lowercase",
  "digit",
  "special",
] as const;

export type PasswordPolicyRule = (typeof passwordPolicyRules)[number];

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
) => password.trim().length > 0 && password === confirmPassword;
