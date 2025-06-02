export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  isPrivate?: boolean;
  allowMessages?: boolean;
  showOnlineStatus?: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  connectionNotifications: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PrivacySettings {
  isPrivate: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowSearch: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  allowMultipleSessions: boolean;
}

export interface AvatarUploadResponse {
  success: boolean;
  avatarUrl: string;
  message?: string;
}
