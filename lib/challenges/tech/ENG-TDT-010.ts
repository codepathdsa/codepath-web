import type { Challenge } from '../types';

// ─── ENG-TDT-010 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-010',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Extract Hardcoded Cloud Provider',
  companies: ['HashiCorp', 'Snowflake'],
  timeEst: '~30 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'FileUploadService calls aws-sdk S3 directly. The company just signed an Azure enterprise deal — deadline is Friday. Introduce IStorageService so providers are swappable without touching business logic.',
  solution: 'Adapter Pattern: define IStorageService (upload/download). Implement S3Adapter and AzureAdapter. FileUploadService depends on IStorageService only — provider injected at startup via env var.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The CEO closed an Azure deal yesterday. EngPrep's file upload pipeline — profile photos, PDF exports, code snapshots — is hardwired to AWS S3. It cannot switch providers without a full rewrite.\n\nThis is vendor lock-in: business logic knows too much about infrastructure.\n\nYour mission: define an IStorageService interface. Move the S3 logic into an S3Adapter. Stub out an AzureAdapter. FileUploadService accepts any IStorageService — the active provider is chosen at startup.`,
    folderPath: 'src/storage',
    primaryFile: 'FileUploadService.ts',
    files: [
      {
        name: 'FileUploadService.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Decouple from aws-sdk.
 * 1. Accept an IStorageService in the constructor.
 * 2. Replace s3.putObject() with this.storage.upload()
 * 3. Replace s3.getObject() with this.storage.download()
 */
export class FileUploadService {
  // Simulated S3 client (imagine aws-sdk here)
  private s3 = { region: 'us-east-1', bucket: 'engprep-assets' };

  async upload(key: string, data: Buffer): Promise<void> {
    // BUG: hardcoded to S3
    console.log('[S3] Uploading ' + key + ' to bucket ' + this.s3.bucket);
  }

  async download(key: string): Promise<Buffer> {
    // BUG: hardcoded to S3
    console.log('[S3] Downloading ' + key + ' from bucket ' + this.s3.bucket);
    return Buffer.alloc(0);
  }
}`,
      },
      {
        name: 'IStorageService.ts',
        lang: 'typescript',
        code: `/**
 * HINT: Define the storage contract here.
 * Both S3Adapter and AzureAdapter will implement this.
 * FileUploadService should depend only on this interface.
 */
export interface IStorageService {
  upload(key: string, data: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
}`,
      },
      {
        name: 'S3Adapter.ts',
        lang: 'typescript',
        code: `import { IStorageService } from './IStorageService';

/**
 * HINT: Wrap the S3 logic here.
 * Move the upload/download implementation from
 * FileUploadService into this class.
 */
export class S3Adapter implements IStorageService {
  async upload(key: string, data: Buffer): Promise<void> {
    console.log('[S3] Uploading: ' + key + ' (' + data.byteLength + ' bytes)');
  }

  async download(key: string): Promise<Buffer> {
    console.log('[S3] Downloading: ' + key);
    return Buffer.alloc(0);
  }
}`,
      },
      {
        name: 'AzureAdapter.ts',
        lang: 'typescript',
        code: `import { IStorageService } from './IStorageService';

/**
 * TODO: Implement the Azure Blob Storage adapter.
 * Simulate calls with console.log for now —
 * the architecture is what matters here.
 */
export class AzureAdapter implements IStorageService {
  async upload(key: string, data: Buffer): Promise<void> {
    // TODO: implement via @azure/storage-blob
    console.log('[Azure] Uploading: ' + key);
  }

  async download(key: string): Promise<Buffer> {
    // TODO: implement via @azure/storage-blob
    console.log('[Azure] Downloading: ' + key);
    return Buffer.alloc(0);
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'FileUploadService accepts IStorageService in its constructor',
        check: { type: 'contains', file: 'FileUploadService.ts', pattern: 'IStorageService' },
      },
      {
        label: 'Remove hardcoded S3 client from FileUploadService (no private s3 = ...)',
        check: { type: 'not_contains', file: 'FileUploadService.ts', pattern: 'private s3' },
      },
      {
        label: 'AzureAdapter implements upload()',
        check: { type: 'contains', file: 'AzureAdapter.ts', pattern: 'upload(' },
      },
    ],
    hints: [
      'In FileUploadService.ts: replace `private s3 = ...` with `constructor(private storage: IStorageService) {}`.',
      'Replace the console.log in upload() with `return this.storage.upload(key, data);` and in download() with `return this.storage.download(key);`.',
      'AzureAdapter already has the right shape — just make sure its upload() signature matches IStorageService exactly.',
    ],
    totalTests: 24,
    testFramework: 'Jest',
    xp: 300,
    successMessage: 'FileUploadService is now cloud-agnostic. Switching between S3 and Azure is a constructor argument. Azure ships on Friday. Adding GCP takes 30 minutes — one new adapter class.',
  },
};

export default challenge;
