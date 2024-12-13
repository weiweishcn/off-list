import React, { useState, useEffect } from 'react';

const DesignComments = ({ projectId, imageUrl, designId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!designId) {
      console.error('No design ID provided');
      setError('Unable to load comments');
      setLoading(false);
      return;
    }
    fetchComments();
  }, [projectId, designId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      console.log('Fetching comments for design:', designId);
      const response = await fetch(`${apiUrl}/api/projects/${projectId}/designs/${designId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!designId) {
      console.error('No design ID provided');
      setError('Unable to add comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      console.log('Submitting comment for design:', designId);
      const response = await fetch(`${apiUrl}/api/projects/${projectId}/designs/${designId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment_text: newCommentText
        })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setNewCommentText('');
      setError(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Design Image */}
      <div>
        <img
          src={imageUrl}
          alt="Design"
          className="max-w-full h-auto rounded-lg"
          onError={(e) => {
            console.error('Image failed to load:', e.target.src);
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }}
        />
      </div>

      {/* Add Comment Form */}
      <div className="bg-white rounded-lg p-4 border">
        <form onSubmit={handleSubmitComment}>
          <textarea
            className="w-full border rounded-md p-2 mb-2"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment about this design..."
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={!newCommentText.trim()}
            >
              Add Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg border bg-white"
            >
              <div>
                <span className="font-medium">{comment.user_email}</span>
                <p className="text-gray-600 mt-1">{comment.comment_text}</p>
                <span className="text-xs text-gray-400 block mt-1">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignComments;