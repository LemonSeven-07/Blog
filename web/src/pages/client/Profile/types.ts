export interface userProfileFormValues {
  username: string;
}

export interface BaseInfoProps {
  handleSubmit(values: userProfileFormValues): void;
}

export interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordProps {
  handleSubmit(values: { oldPassword: string; newPassword: string }, cb: () => void): void;
}

export interface ChangeEmailFormValues {
  password: string;
  email: string;
  code: string;
}

export interface ChangeEmailProps {
  handleSubmit(values: ChangeEmailFormValues, cb: () => void): void;
}
