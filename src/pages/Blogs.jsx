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

// ✅ Utility: compress image
const compressImage = (file, maxWidth = 150, maxHeight = 150) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
    };

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
  const [currentPage, setCurrentPage] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [previewBlog, setPreviewBlog] = useState(null);

  useEffect(() => {
    if (currentPage === 'list') fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=list`);
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error("Fetch error:", err);
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

  // Convert Google Drive direct download links to view links
  const getDirectDriveUrl = (url) => {
    if (!url) return url;
    
    // If it's already a view link, return as is
    if (url.includes('/file/d/') && url.includes('/view')) {
      return url;
    }
    
    // Extract file ID from various Google Drive URL formats
    let fileId;
    
    // Format 1: https://drive.google.com/uc?export=download&id=FILE_ID
    let match = url.match(/[&?]id=([^&]+)/);
    if (match) {
      fileId = match[1];
    }
    
    // Format 2: Direct ID (just in case)
    if (!fileId && url.length === 33) { // Google Drive IDs are 33 characters
      fileId = url;
    }
    
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

        const uploadResult = await postToScript("uploadImage", {
          base64: base64Data,
          fileName,
        });

        const uploadSmall = await postToScript("uploadImage", {
          base64: compressedBase64,
          fileName: smallFileName,
        });

        thumbnailUrl = getDirectDriveUrl(uploadResult.url);
        thumbnailSmallUrl = getDirectDriveUrl(uploadSmall.url);
      }

      const postData = {
        title,
        author,
        content: contentMarkdown,
        thumbnailUrl,
        thumbnailSmallUrl,
      };

      if (editingId) {
        await postToScript("updatePost", {
          id: editingId,
          ...postData,
        });
      } else {
        await postToScript("createPost", postData);
      }

      resetForm();
      setCurrentPage("list");
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Error submitting post. Check console for details.");
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
    if (!window.confirm('Are you sure you want to delete this blog post?'))
      return;

    try {
      setLoading(true);
      await postToScript('delete', { id });
      await fetchBlogs();
      alert('Blog deleted successfully!');
    } catch (err) {
      setError(err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewBlogPost = (blog) => {
    setPreviewBlog(blog);
  };

  const closePreview = () => {
    setPreviewBlog(null);
  };


  const renderEditor = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
        <button 
          onClick={() => { resetForm(); setCurrentPage('list'); }} 
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Blogs
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Title *</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
            required 
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">Content *</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <LexicalComposer initialConfig={editorConfig(contentMarkdown)}>
              <div className="editor-container">
                <RichTextPlugin
                  contentEditable={<ContentEditable className="editor-input min-h-[300px] p-4" />}
                  placeholder={<div className="editor-placeholder p-4 text-gray-400">Enter content...</div>}
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

        <div>
          <label className="block mb-2 font-medium text-gray-700">Author *</label>
          <input 
            type="text" 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
            required 
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Thumbnail {!editingId && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-500 mt-2">Upload thumbnail</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleThumbnailChange} 
                required={!editingId} 
                className="hidden" 
              />
            </label>
            {thumbnailPreview && (
              <div className="relative">
                <img 
                  src={thumbnailPreview} 
                  alt="Preview" 
                  className="w-40 h-40 object-cover rounded-lg shadow-sm" 
                />
                <button 
                  type="button"
                  onClick={() => { setThumbnail(null); setThumbnailPreview(''); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {thumbnailError && <p className="text-red-500 text-sm mt-2">{thumbnailError}</p>}
          {editingId && !thumbnail && (
            <p className="text-sm text-gray-500 mt-2">
              Leave empty to keep current thumbnail
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            onClick={resetForm} 
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Reset
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editingId ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              <>
                {editingId ? 'Update Post' : 'Publish Post'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderBlogList = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {previewBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{previewBlog.Title}</h3>
                <button onClick={closePreview} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {previewBlog.ThumbnailURL && (
                <img 
                  src={previewBlog.ThumbnailURL} 
                  alt="Thumbnail" 
                  className="w-full h-64 object-cover mb-6 rounded-lg shadow-md" 
                />
              )}
              <div 
                className="prose max-w-none mb-6" 
                dangerouslySetInnerHTML={{ __html: previewBlog.Content }} 
              />
              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <p className="font-medium">By {previewBlog.Author}</p>
                <p>Published: {new Date(previewBlog.CreatedAt).toLocaleDateString()}</p>
                {previewBlog.UpdatedAt !== previewBlog.CreatedAt && (
                  <p>Updated: {new Date(previewBlog.UpdatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Blog Posts</h2>
          <p className="text-gray-500 mt-1">Manage your blog content</p>
        </div>
        <button 
          onClick={() => { resetForm(); setCurrentPage('editor'); }} 
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Post
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No blog posts yet</h3>
          <p className="mt-1 text-gray-500">Get started by creating your first blog post.</p>
          <button 
            onClick={() => { resetForm(); setCurrentPage('editor'); }} 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map(blog => (
                  <tr key={blog.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {blog.ThumbnailSmallURL ? (
                        <img 
                          src={blog.ThumbnailSmallURL} 
                          alt="Thumbnail" 
                          className="h-12 w-12 rounded-md object-cover shadow-sm" 
                          loading="lazy"
                        />
                      ) : blog.ThumbnailURL ? (
                        <img 
                          src={blog.ThumbnailURL} 
                          alt="Thumbnail" 
                          className="h-12 w-12 rounded-md object-cover shadow-sm" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{blog.Title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {blog.Author}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(blog.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => previewBlogPost(blog)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Preview"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => editBlog(blog.ID)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteBlog(blog.ID)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
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
    <div className="min-h-screen bg-gray-50 pb-10">
      {currentPage === 'editor' ? renderEditor() : renderBlogList()}
    </div>
  );
};

export default BlogEditor;