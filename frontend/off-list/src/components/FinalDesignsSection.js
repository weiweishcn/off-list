import React, { useState, useEffect } from 'react';

const FinalDesignsSection = ({ 
  projectId, 
  designs = [], 
  isDesigner = false,
  onUploadDesigns,
  uploadingDesigns = false 
}) => {
  // Ensure we have valid designs with proper structure and IDs
  const validDesigns = designs?.map((design, index) => ({
    ...design,
    id: design.id || `temp-id-${index}`, // Ensure each design has an ID
    design_url: design.design_url || design.url
  })).filter(design => design && design.design_url) || [];

  const [selectedDesignIndex, setSelectedDesignIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Load comments when selected design changes
  useEffect(() => {
    if (validDesigns.length > 0) {
      loadComments(validDesigns[selectedDesignIndex].id);
    }
  }, [selectedDesignIndex, validDesigns]);

  const loadComments = async (designId) => {
    //setIsLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/projects/${projectId}/designs/${designId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(null); // Don't show error for loading comments
      setComments([]); // Reset comments on error
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const currentDesign = validDesigns[selectedDesignIndex];
    
    if (!projectId || !currentDesign?.id || !newCommentText.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/projects/${projectId}/designs/${currentDesign.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ comment_text: newCommentText.trim() })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();
      setComments(prevComments => [newComment, ...prevComments]);
      setNewCommentText('');
      setError(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">
        {isDesigner ? "Final Designs" : "Designer's Final Designs"}
      </h2>

      {/* Upload Section for Designer */}
      {isDesigner && (
        <div className="mb-6 pb-6 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload New Designs
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUploadDesigns}
            disabled={uploadingDesigns}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploadingDesigns && (
            <p className="mt-2 text-sm text-gray-500">Uploading designs...</p>
          )}
        </div>
      )}

      {/* Design Tabs */}
      {validDesigns.length > 0 && (
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            {validDesigns.map((design, index) => (
              <button
                key={design.id}
                className={`px-4 py-2 font-medium focus:outline-none ${
                  selectedDesignIndex === index
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedDesignIndex(index)}
              >
                Design {index + 1}
              </button>
            ))}
          </div>

          {/* Selected Design Display */}
          <div className="mt-6">
            <img
              src={validDesigns[selectedDesignIndex].design_url}
              alt={`Design ${selectedDesignIndex + 1}`}
              className="w-full h-auto object-cover rounded-lg"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.src = '/api/placeholder/400/300';
              }}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-4">
                {error}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mt-6">
              <textarea
                className="w-full border rounded-md p-4 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment about this design..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Comment
                </button>
              </div>
            </form>

            {/* Comments Display */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Comments ({comments.length})
              </h3>
              <div className="space-y-4">
                {isLoadingComments ? (
                  <p className="text-center text-gray-500 py-4">Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-t pt-4">
                      <p className="font-medium text-sm">{comment.user_email}</p>
                      <p className="text-gray-600 mt-1">{comment.comment_text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {validDesigns.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {isDesigner ? "Upload your first design to get started" : "No designs available yet"}
        </div>
      )}
    </div>
  );
};

export default FinalDesignsSection;