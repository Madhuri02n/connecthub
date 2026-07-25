import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, X } from 'lucide-react';
import { postService } from '../services/postService';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export const CreatePostPage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast.error('Image must be under 8MB');
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose an image to post');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await postService.createPost(file, caption);
      toast.success('Post published');
      navigate(`/posts/${data.post._id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-semibold">New post</h1>

      <form onSubmit={handleSubmit} className="contact-frame p-6">
        {previewUrl ? (
          <div className="relative mb-4">
            <img src={previewUrl} alt="Preview" className="max-h-96 w-full rounded-lg object-cover" />
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove image"
              className="absolute right-2 top-2 rounded-full bg-ink-950/70 p-1.5 text-paper-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="post-image"
            className="mb-4 flex h-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-700/20 text-ink-600 hover:border-safelight-500 dark:border-paper-300/20 dark:text-paper-300/60"
          >
            <ImagePlus size={32} />
            <span className="text-sm">Click to choose an image</span>
          </label>
        )}
        <input
          id="post-image"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={2200}
          rows={3}
          placeholder="Write a caption... use #hashtags to help people find it"
          className="input-field mb-1 resize-none"
        />
        <p className="mb-4 text-right text-xs text-ink-600 dark:text-paper-300/40">{caption.length}/2200</p>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </button>
      </form>
    </div>
  );
};
