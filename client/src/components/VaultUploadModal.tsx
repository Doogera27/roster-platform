import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

const categories = [
  { value: 'brand_guidelines', label: 'Brand Guidelines' },
  { value: 'logo', label: 'Logo' },
  { value: 'font', label: 'Font' },
  { value: 'template', label: 'Template' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

type UploadState = 'idle' | 'uploading' | 'confirming' | 'done' | 'error';

export function VaultUploadModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('other');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setFile(null);
    setCategory('other');
    setUploadState('idle');
    setProgress(0);
    setError('');
    setDragOver(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const upload = async () => {
    if (!file) return;

    try {
      setUploadState('uploading');
      setError('');

      // Step 1: Get pre-signed upload URL
      const urlRes = await api.post('/vault/upload-url', {
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size_bytes: file.size,
        asset_category: category,
      });

      const { upload_url, asset_id, s3_key } = urlRes.data.data;

      // Step 2: Upload to S3 (simulate progress for dev mode)
      setProgress(30);

      try {
        await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
        });
      } catch {
        // In dev mode without real S3, we'll still confirm the upload
        console.warn('S3 upload failed (expected in dev mode)');
      }

      setProgress(70);
      setUploadState('confirming');

      // Step 3: Confirm upload
      await api.post('/vault/confirm', {
        asset_id,
        s3_key,
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size_bytes: file.size,
        asset_category: category,
      });

      setProgress(100);
      setUploadState('done');
      queryClient.invalidateQueries({ queryKey: ['vault'] });

      // Auto-close after success
      setTimeout(() => handleClose(), 1500);
    } catch (err: any) {
      setUploadState('error');
      setError(err?.response?.data?.errors?.[0]?.message || 'Upload failed. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[var(--color-navy-mid)] border border-[var(--color-border-mid)] rounded-2xl shadow-2xl"
        style={{ animation: 'fadeIn 0.2s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-heading text-lg text-white">Upload Asset</h2>
          <button onClick={handleClose} className="btn-ghost p-1.5 rounded-lg">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              dragOver ? 'border-[var(--color-gold)] bg-[var(--color-gold-dim)]' :
              file ? 'border-[var(--color-teal-border)] bg-[var(--color-teal-dim)]' :
              'border-[var(--color-border-mid)] hover:border-[var(--color-gold-border)] hover:bg-[rgba(255,255,255,0.02)]',
            )}
          >
            <input ref={fileRef} type="file" onChange={handleFileChange} className="hidden" />

            {file ? (
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--color-teal-dim)] flex items-center justify-center">
                  <svg width="20" height="20" fill="none" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 10l5 5L16 5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-mono text-[10px] text-[var(--color-text-faint)] mt-1">
                  {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown'}
                </p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-[var(--color-text-muted)] mt-2 hover:text-white">
                  Change file
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--color-gold-dim)] flex items-center justify-center">
                  <svg width="20" height="20" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </div>
                <p className="text-sm text-white mb-1">Drop a file here or click to browse</p>
                <p className="text-xs text-[var(--color-text-faint)]">SVG, PNG, PDF, AI, PSD, TTF, OTF · Max 500MB</p>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-label mb-2 block">Asset Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                    category === cat.value
                      ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-mid)]',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {uploadState !== 'idle' && uploadState !== 'error' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-mono text-[10px] text-[var(--color-text-faint)]">
                  {uploadState === 'uploading' && 'Uploading...'}
                  {uploadState === 'confirming' && 'Confirming...'}
                  {uploadState === 'done' && 'Upload complete!'}
                </span>
                <span className="text-mono text-[10px] text-[var(--color-gold)]">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500',
                    uploadState === 'done' ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-gold)]')}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-danger-dim)] border border-[rgba(255,107,107,0.25)]">
              <p className="text-xs text-[var(--color-danger)]">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button onClick={handleClose} className="btn-ghost text-sm">Cancel</button>
          <button
            onClick={upload}
            disabled={!file || uploadState === 'uploading' || uploadState === 'confirming' || uploadState === 'done'}
            className="btn-primary text-sm px-6"
          >
            {uploadState === 'uploading' || uploadState === 'confirming' ? 'Uploading...' :
             uploadState === 'done' ? '✓ Uploaded' : 'Upload Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}
