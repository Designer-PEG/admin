import { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, $convertToMarkdownString } from '@lexical/markdown';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { 
  FiPlus, FiChevronLeft, FiImage, FiTrash2, 
  FiEdit3, FiEye, FiCheck, FiX, FiInfo
} from 'react-icons/fi';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const GOOGLE_SCRIPT_URL = "/api";

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
};

function onError(error) {
  console.error(error);
}

function editorConfig(initialContent) {
  return {
    namespace: 'BlogEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editorState: initialContent ? () => {} : undefined,
  };
}

const ErrorBoundary = ({ children }) => <>{children}</>;

const compressImage = (file, maxWidth = 150, maxHeight = 150) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const BlogEditor = () => {
  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [author, setAuthor] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailError, setThumbnailError] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [previewBlog, setPreviewBlog] = useState(null);

  useEffect(() => {
    if (currentPage === 'list') fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=list`);
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const postToScript = async (action, data = {}) => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      return await res.json();
    } catch (err) {
      console.error(`Error in ${action}:`, err);
      throw err;
    }
  };

  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      setContentMarkdown(markdown);
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setThumbnailError('Image must be smaller than 5MB');
        return;
      }
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
      setThumbnailError('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContentMarkdown('');
    setAuthor('');
    setThumbnail(null);
    setThumbnailPreview('');
    setThumbnailError('');
    setEditingId(null);
    setError(null);
  };

  const getDirectDriveUrl = (url) => {
    if (!url) return url;
    if (url.includes('/file/d/') && url.includes('/view')) return url;
    let fileId;
    let match = url.match(/[&?]id=([^&]+)/);
    if (match) fileId = match[1];
    if (!fileId && url.length === 33) fileId = url;
    return fileId ? `https://drive.google.com/file/d/${fileId}/view` : url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let thumbnailUrl = "";
      let thumbnailSmallUrl = "";
      if (thumbnail) {
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(thumbnail);
        });
        const compressedBase64 = await compressImage(thumbnail, 150, 150);
        const fileName = `thumbnail-${Date.now()}.${thumbnail.name.split(".").pop()}`;
        const smallFileName = `thumbnail-small-${Date.now()}.jpg`;
        const uploadResult = await postToScript("uploadImage", { base64: base64Data, fileName });
        const uploadSmall = await postToScript("uploadImage", { base64: compressedBase64, fileName: smallFileName });
        thumbnailUrl = getDirectDriveUrl(uploadResult.url);
        thumbnailSmallUrl = getDirectDriveUrl(uploadSmall.url);
      }
      const postData = { title, author, content: contentMarkdown, thumbnailUrl, thumbnailSmallUrl };
      if (editingId) {
        await postToScript("updatePost", { id: editingId, ...postData });
      } else {
        await postToScript("createPost", postData);
      }
      resetForm();
      setCurrentPage("list");
    } catch (error) {
      console.error("Error submitting post:", error);
      setError("Error submitting post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const editBlog = (id) => {
    const blog = blogs.find((b) => b.ID === id);
    if (blog) {
      setTitle(blog.Title);
      setAuthor(blog.Author);
      setThumbnailPreview(blog.ThumbnailURL);
      setContentMarkdown(blog.Content);
      setEditingId(id);
      setCurrentPage('editor');
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      setLoading(true);
      await postToScript('delete', { id });
      await fetchBlogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderEditor = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details for your blog post</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { resetForm(); setCurrentPage('list'); }}>
          <FiChevronLeft className="mr-1" /> Back to List
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input 
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input 
                  type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition outline-none" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail {!editingId && <span className="text-red-500 font-bold">*</span>}</label>
              <div className="flex items-start gap-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400 group-hover:text-blue-500">
                    <FiImage className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Upload Image</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} required={!editingId} className="hidden" />
                </label>
                {thumbnailPreview && (
                  <div className="relative group">
                    <img src={thumbnailPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-gray-100 shadow-sm" />
                    <button 
                      type="button" onClick={() => { setThumbnail(null); setThumbnailPreview(''); }}
                      className="absolute -top-2 -right-2 bg-white text-gray-500 rounded-full p-1.5 shadow-md border border-gray-100 hover:text-red-500 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {thumbnailError && <p className="text-red-500 text-xs mt-1">{thumbnailError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <LexicalComposer initialConfig={editorConfig(contentMarkdown)}>
                <div className="relative">
                  <RichTextPlugin
                    contentEditable={<ContentEditable className="min-h-[300px] p-4 text-sm outline-none bg-gray-50/30" />}
                    placeholder={<div className="absolute top-4 left-4 text-sm text-gray-400 pointer-events-none">Start writing...</div>}
                    ErrorBoundary={ErrorBoundary}
                  />
                  <OnChangePlugin onChange={handleEditorChange} />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                </div>
              </LexicalComposer>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center gap-2">
              <FiInfo className="shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={resetForm} disabled={loading}>Reset</Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              {editingId ? 'Update Post' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderBlogList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and organize your content</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setCurrentPage('editor'); }}>
          <FiPlus className="mr-1" /> New Post
        </Button>
      </div>

      {previewBlog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">{previewBlog.Title}</h3>
              <button onClick={() => setPreviewBlog(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              {previewBlog.ThumbnailURL && (
                <img src={previewBlog.ThumbnailURL} alt="Thumbnail" className="w-full h-72 object-cover rounded-xl mb-8 shadow-sm" />
              )}
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: previewBlog.Content }} />
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>By <span className="text-gray-900">{previewBlog.Author}</span></span>
                <span>{new Date(previewBlog.CreatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2">
          <FiInfo className="shrink-0" /> {error}
        </div>
      )}

      {loading && blogs.length === 0 ? (
        <Loader text="Fetching blogs..." />
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiEdit3 className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No blog posts yet</h3>
          <p className="text-sm text-gray-400 mt-1">Ready to share your insights?</p>
          <Button variant="primary" className="mt-6" onClick={() => { resetForm(); setCurrentPage('editor'); }}>
            Create First Post
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map(blog => (
                  <tr key={blog.ID} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-50">
                        {blog.ThumbnailSmallURL || blog.ThumbnailURL ? (
                          <img src={blog.ThumbnailSmallURL || blog.ThumbnailURL} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FiImage className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{blog.Title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 font-medium">{blog.Author}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(blog.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" title="Preview" onClick={() => setPreviewBlog(blog)}>
                          <FiEye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => editBlog(blog.ID)} className="text-blue-600 hover:bg-blue-50">
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => deleteBlog(blog.ID)} className="text-red-600 hover:bg-red-50">
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {currentPage === 'editor' ? renderEditor() : renderBlogList()}
    </div>
  );
};

export default BlogEditor;