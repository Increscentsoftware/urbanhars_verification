// Shared OTP store - in production use Redis
export const OTP_STORE = new Map<string, { otp: string; expires: number; attempts: number }>()
