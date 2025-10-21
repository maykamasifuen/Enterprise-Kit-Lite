export interface User {
  username: string;
  tenantId: string;
  roles?: string[];
  preferredLanguage?: string;
  fullName?: string;
}
