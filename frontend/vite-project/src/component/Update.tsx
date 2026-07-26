import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { UPDATEBLOGCARDS } from '../services/mutations';
import { useParams } from 'react-router-dom';
import { CURRENT_BLOGS_QUERY } from '../services/queries';
import { useSelector } from 'react-redux';

interface FormData {
  ProjectName: string;
  Describtion: string;
  GitHubLink: string;
  LiveLink: string;
}

interface Blogdata {
  ProjectName: string;
  Describtion: string;
  GithubLink: string;
  image: string;
  BlogOwner: {
    _id: string;
  };
  ProjectLink: string;
  createdAt: string;
}

// The query returns the blog wrapped under `CurrentBlog`, so the query's
// generic type needs to reflect that shape (previously typed as `Blogdata`
// directly, which didn't match how `data.CurrentBlog.*` was being accessed).
interface CurrentBlogQueryResult {
  CurrentBlog: Blogdata;
}

const EMPTY_FORM: FormData = {
  ProjectName: '',
  Describtion: '',
  GitHubLink: '',
  LiveLink: '',
};

function UpdateBlog() {
  const { BlogId } = useParams<{ BlogId: string }>();
  const currentUser = useSelector((state: any) => state.auth.user);

  const { data, loading: queryLoading, error: queryError } = useQuery<CurrentBlogQueryResult>(
    CURRENT_BLOGS_QUERY,
    { variables: { id: BlogId } }
  );

  // ---- All hooks live here, unconditionally, in the same order on every
  // render. No early `return` is allowed before this point — that's what
  // was causing "change in the order of Hooks" before. ----

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData> & { image?: string }>({});

  // ---- Image upload state ----
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [updateBlog, { loading: submitting, error: submitError }] = useMutation(UPDATEBLOGCARDS);

  // Sync form + image preview once the current blog data loads (or changes).
  useEffect(() => {
    if (!data?.CurrentBlog) return;

    const blog = data.CurrentBlog;
    setFormData({
      ProjectName: blog.ProjectName ?? '',
      Describtion: blog.Describtion ?? '',
      GitHubLink: blog.GithubLink ?? '',
      LiveLink: blog.ProjectLink ?? '',
    });
    setExistingImage(blog.image ?? '');
    setImagePreview(blog.image ?? '');
  }, [data]);

  // BlogOwner is an object ({_id, ...}), so compare the ids, not the objects.
  const isOwner = data?.CurrentBlog?.BlogOwner?._id === currentUser?._id;

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> & { image?: string } = {};

    if (!formData.ProjectName.trim()) {
      newErrors.ProjectName = 'Project name is required';
    }

    if (!formData.Describtion.trim()) {
      newErrors.Describtion = 'Description is required';
    } else if (formData.Describtion.trim().length < 10) {
      newErrors.Describtion = 'Description must be at least 10 characters';
    }

    // GitHub link is required and must be a valid URL
    if (!formData.GitHubLink.trim()) {
      newErrors.GitHubLink = 'GitHub link is required';
    } else {
      try {
        new URL(formData.GitHubLink.trim());
      } catch {
        newErrors.GitHubLink = 'Enter a valid URL for the GitHub link';
      }
    }

    // Live project link is required and must be a valid URL
    if (!formData.LiveLink.trim()) {
      newErrors.LiveLink = 'Live project link is required';
    } else {
      try {
        new URL(formData.LiveLink.trim());
      } catch {
        newErrors.LiveLink = 'Enter a valid URL for the live project link';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      toast.error('Please select a valid image file');
      return;
    }

    setErrors(prev => ({ ...prev, image: '' }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    toast.info('Image selected successfully');
  };

  // Clears only the *newly selected* image, reverting back to whatever
  // image already exists on the blog (rather than removing it entirely).
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(existingImage);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formDataToSend = new FormData();
    formDataToSend.append('image', file);

    const res = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formDataToSend,
      credentials: 'include',
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Image upload failed');
    }

    return result.url as string;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Extra safety net: even if the UI is somehow bypassed, don't let a
    // non-owner trigger an upload or mutation call.
    if (!isOwner) {
      toast.error("You don't have permission to update this blog.");
      return;
    }

    if (!validateForm()) return;

    try {
      // Default to the existing image; only replace it if a new file was picked.
      let imageUrl = existingImage;

      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } finally {
          setUploadingImage(false);
        }
      }
      const { data: mutationData } = await updateBlog({
        variables: {
          blogid: BlogId,
          projectName: formData.ProjectName,
          describtion: formData.Describtion,
          projectLink: formData.LiveLink,
          githubLink: formData.GitHubLink,
          image: imageUrl,
        },
      });

      if (mutationData) {
        setExistingImage(imageUrl);
        setImageFile(null);
        toast.success('✨ Blog updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating blog. Please try again.');
      console.error('Error updating blog:', err);
    }
  };

  const handleResetToOriginal = () => {
    if (!data?.CurrentBlog) return;
    const blog = data.CurrentBlog;
    setFormData({
      ProjectName: blog.ProjectName ?? '',
      Describtion: blog.Describtion ?? '',
      GitHubLink: blog.GithubLink ?? '',
      LiveLink: blog.ProjectLink ?? '',
    });
    setErrors({});
    setImageFile(null);
    setImagePreview(blog.image ?? '');
  };

  // ---- All hooks have now been called on every render. Guard returns are
  // safe below this point. ----

  if (queryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (queryError || !data?.CurrentBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
        <p className="text-red-400 font-semibold">
          {queryError?.message || 'Blog not found.'}
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
        <div className="text-center">
          <p className="text-red-400 font-semibold">You don't have permission to edit this blog.</p>
          <p className="text-slate-400 text-sm mt-2">Only the blog owner can update it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-color)' }}>
      {/* Header Section */}
      <div className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.06), rgba(124,58,237,0.06))' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Update Blog
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Edit and refine your project details
            </p>
            <div className="h-1 w-20 bg-linear-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur border border-white/6 rounded-2xl p-8 shadow-xl">
          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 font-semibold">
                {submitError.message || 'Error updating blog. Please try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name Field */}
            <div>
              <label htmlFor="ProjectName" className="block text-sm font-semibold text-slate-300 mb-3">
                Project Title *
              </label>
              <input
                type="text"
                id="ProjectName"
                name="ProjectName"
                value={formData.ProjectName}
                onChange={handleChange}
                placeholder="Enter your blog title"
                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                  errors.ProjectName
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-purple-500'
                }`}
              />
              {errors.ProjectName && (
                <p className="mt-2 text-sm text-red-400">{errors.ProjectName}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="Describtion" className="block text-sm font-semibold text-slate-300 mb-3">
                Description *
              </label>
              <textarea
                id="Describtion"
                name="Describtion"
                value={formData.Describtion}
                onChange={handleChange}
                placeholder="Write your blog content here... (minimum 10 characters)"
                rows={8}
                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none transition-all duration-300 resize-none ${
                  errors.Describtion
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-purple-500'
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                {errors.Describtion && (
                  <p className="text-sm text-red-400">{errors.Describtion}</p>
                )}
                <p className={`text-xs ${
                  formData.Describtion.length < 10 ? 'text-slate-500' : 'text-green-400'
                }`}>
                  {formData.Describtion.length} / 10 characters minimum
                </p>
              </div>
            </div>

            {/* Blog Image Field */}
            <div>
              <label htmlFor="blogImage" className="block text-sm font-semibold text-slate-300 mb-3">
                Blog Image
              </label>

              {!imagePreview ? (
                <label
                  htmlFor="blogImage"
                  className={`flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 ${
                    errors.image
                      ? 'border-red-500'
                      : 'border-slate-600 hover:border-purple-500'
                  }`}
                >
                  <span className="text-slate-400 text-sm">Click to select an image</span>
                  <span className="text-slate-500 text-xs mt-1">PNG, JPG, WEBP</span>
                  <input
                    type="file"
                    id="blogImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Blog preview"
                    className="w-full max-h-64 object-cover rounded-lg border border-slate-600"
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-500/80 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-all duration-300"
                    >
                      Revert to original
                    </button>
                  )}
                </div>
              )}

              {errors.image && (
                <p className="mt-2 text-sm text-red-400">{errors.image}</p>
              )}
            </div>

            <div>
              <label htmlFor="GitHubLink" className="block text-sm font-semibold text-slate-300 mb-3">
                GitHub Repository
              </label>
              <input
                type="url"
                id="GitHubLink"
                name="GitHubLink"
                value={formData.GitHubLink}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                  errors.GitHubLink
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-purple-500'
                }`}
              />
              {errors.GitHubLink && (
                <p className="mt-2 text-sm text-red-400">{errors.GitHubLink}</p>
              )}
            </div>

            <div>
              <label htmlFor="LiveLink" className="block text-sm font-semibold text-slate-300 mb-3">
                Live Project Link
              </label>
              <input
                type="url"
                id="LiveLink"
                name="LiveLink"
                value={formData.LiveLink}
                onChange={handleChange}
                placeholder="https://yourapp.example.com"
                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none transition-all duration-300 ${
                  errors.LiveLink
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-purple-500'
                }`}
              />
              {errors.LiveLink && (
                <p className="mt-2 text-sm text-red-400">{errors.LiveLink}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="flex-1 py-3 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition"
                style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading image...
                  </>
                ) : submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-6 py-3 text-slate-200 font-semibold rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-all duration-300 bg-[rgba(255,255,255,0.01)]"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Tips for great content:</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Use clear and descriptive titles that capture the essence of your blog</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Write detailed descriptions that help readers understand your content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✓</span>
                <span>Keep your writing clear, concise, and well-organized</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateBlog;