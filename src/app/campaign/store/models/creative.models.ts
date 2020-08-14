export interface Creative {
  id: string;
  url?: string;
  filename?: string;
  set_account_uri: string;
  set_advertiser_uri: string;
  pingbacks?: string[];
  fileSize?: number;
  mimeType?: string;
}
