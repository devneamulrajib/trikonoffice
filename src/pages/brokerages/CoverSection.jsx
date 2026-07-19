import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ImagePlus, Video, Pencil, Loader2 } from 'lucide-react';

/*
  CoverSection
  ────────────────────────────────────────────────────────────────────────
  A responsive hero/cover banner that accepts either an image or a video
  upload, automatically optimizes the media on the client (resize +
  recompress images, generate a compressed poster frame for videos),
  keeps a fixed aspect ratio at every breakpoint, lazy-loads the actual
  video byte-stream (only the lightweight poster paints immediately),
  and never blocks the page — all processing happens off the main
  render path inside promises/canvas operations.

  Props
  ────────────────────────────────────────────────────────────────────────
  cover          { type: 'image'|'video', url, posterUrl?, name, size }|null
  onChange       (nextCoverObjectOrNull) => void
  eyebrow        string  – small label above the title
  title          string
  subtitle       string
  primaryAction  { label, icon, onClick } | null
  statsSlot      JSX – rendered as a floating row over the bottom edge
*/

const MAX_IMAGE_WIDTH = 1920;
const IMAGE_QUALITY = 0.82;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB soft cap

// ── Resize + recompress an image file via canvas, return an object URL ──
const optimizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            resolve({ url: URL.createObjectURL(blob), blob, width: w, height: h, size: blob.size });
          },
          'image/jpeg',
          IMAGE_QUALITY
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// ── Grab a frame from a video and compress it into a poster image ──────
const generateVideoPoster = (videoUrl) =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';

    const cleanup = () => {
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    const onError = () => { cleanup(); reject(new Error('Could not read video')); };
    const onLoaded = () => {
      // seek slightly in so we don't capture a black first frame
      video.currentTime = Math.min(0.35, (video.duration || 1) / 4);
    };
    const onSeeked = () => {
      const scale = Math.min(1, MAX_IMAGE_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale) || 1280;
      const h = Math.round(video.videoHeight * scale) || 720;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (!blob) return reject(new Error('Poster compression failed'));
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        IMAGE_QUALITY
      );
    };
    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
  });

const CoverSection = ({
  cover,
  onChange,
  eyebrow,
  title,
  subtitle,
  primaryAction,
  statsSlot,
}) => {
  const inputRef = useRef(null);
  const shellRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [inView, setInView] = useState(false);

  // Only stream the actual <video> element once the banner is visible —
  // avoids paying for video bytes on a page load where it's off-screen.
  useEffect(() => {
    if (!shellRef.current || cover?.type !== 'video') return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(shellRef.current);
    return () => obs.disconnect();
  }, [cover?.type]);

  // Revoke object URLs we created when they're replaced/unmounted.
  useEffect(() => {
    return () => {
      if (cover?.url?.startsWith('blob:')) URL.revokeObjectURL(cover.url);
      if (cover?.posterUrl?.startsWith('blob:')) URL.revokeObjectURL(cover.posterUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = useCallback(async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    setError('');

    if (file.type.startsWith('image/')) {
      setBusy(true);
      try {
        const { url, size } = await optimizeImage(file);
        onChange({ type: 'image', url, name: file.name, size });
      } catch (e) {
        setError('That image could not be processed. Try a different file.');
      } finally {
        setBusy(false);
      }
      return;
    }

    if (file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_BYTES) {
        setError('Videos over 100MB aren\u2019t supported yet — try a shorter clip or compress it first.');
        return;
      }
      setBusy(true);
      try {
        const videoUrl = URL.createObjectURL(file);
        const posterUrl = await generateVideoPoster(videoUrl);
        setInView(false);
        onChange({ type: 'video', url: videoUrl, posterUrl, name: file.name, size: file.size });
      } catch (e) {
        setError('That video could not be processed. Try a different file.');
      } finally {
        setBusy(false);
      }
      return;
    }

    setError('Please upload an image or a video file.');
  }, [onChange]);

  const openPicker = () => inputRef.current?.click();

  return (
    <div ref={shellRef} className="cover-shell">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* ── Media layer ── */}
      {cover?.type === 'image' && (
        <img
          className="cover-media-img"
          src={cover.url}
          alt={title || 'Cover'}
          loading="eager"
          decoding="async"
        />
      )}

      {cover?.type === 'video' && (
        <>
          <img
            className="cover-media-img"
            src={cover.posterUrl}
            alt={title || 'Cover'}
            loading="eager"
            decoding="async"
            style={{ opacity: inView ? 0 : 1, transition: 'opacity 0.3s ease' }}
          />
          {inView && (
            <video
              className="cover-media-video"
              src={cover.url}
              poster={cover.posterUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          )}
        </>
      )}

      {!cover && (
        <div
          className={`cover-upload-zone${dragOver ? ' drag-over' : ''}`}
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        >
          {busy ? (
            <Loader2 size={26} className="spin" style={{ animation: 'spin 0.9s linear infinite' }} />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <ImagePlus size={22} />
                <Video size={22} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Add a cover photo or video</div>
              <div style={{ fontSize: 12.5, opacity: 0.75 }}>
                Drag & drop, or click to browse — optimized automatically
              </div>
            </>
          )}
          {error && (
            <div style={{ fontSize: 12, color: '#FCA5A5', maxWidth: 320 }}>{error}</div>
          )}
        </div>
      )}

      {/* ── Scrim + content overlay (only once media exists) ── */}
      {cover && (
        <>
          <div className="cover-scrim" />
          <div className="cover-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                {eyebrow && <div className="cover-eyebrow">{eyebrow}</div>}
                <h1 className="cover-title">{title}</h1>
                {subtitle && <p className="cover-subtitle">{subtitle}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button type="button" className="cover-glass-btn" onClick={openPicker} disabled={busy}>
                  {busy ? <Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Pencil size={14} />}
                  {busy ? 'Optimizing…' : 'Change cover'}
                </button>
                {primaryAction && (
                  <button type="button" className="btn-primary" onClick={primaryAction.onClick}>
                    {primaryAction.icon}
                    {primaryAction.label}
                  </button>
                )}
              </div>
            </div>
            <div style={{ height: 46 }} />
          </div>
        </>
      )}

      {error && cover && (
        <div style={{
          position: 'absolute', left: 20, bottom: 60, zIndex: 6,
          fontSize: 12, color: '#fff', background: 'rgba(220,38,38,0.9)',
          padding: '6px 12px', borderRadius: 8,
        }}>
          {error}
        </div>
      )}

      {/* Floating stats row, anchored to the bottom edge of the cover */}
      {statsSlot && <div className="cover-stats-row">{statsSlot}</div>}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CoverSection;