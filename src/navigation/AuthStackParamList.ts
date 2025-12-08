export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  OTPVerification: { phoneNumber: string };
  AvatarSelection: { username: string };
};
