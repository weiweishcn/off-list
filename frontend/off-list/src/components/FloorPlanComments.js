import React, { useState, useEffect } from 'react';

const FloorPlanComments = ({ projectId, imageUrl }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [projectId]);

const fetchComments = async () => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/projects/${projectId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch comments');
    
    const data = await response.json();
    setComments(data);
  } catch (err) {
    console.error('Error fetching comments:', err);
  } finally {
    setLoading(false);
  }
};

const handleSubmitComment = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/projects/${projectId}/comments`, {
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
  } catch (err) {
    console.error('Error adding comment:', err);
  }
};

  if (loading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Floor Plan Image */}
      <div>
        <img
          src={imageUrl}
          alt="Floor Plan"
          className="max-w-full h-auto rounded-lg"
        />
      </div>

      {/* Add Comment Form */}
      <div className="bg-white rounded-lg p-4 border">
        <form onSubmit={handleSubmitComment}>
          <textarea
            className="w-full border rounded-md p-2 mb-2"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment about this floor plan..."
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

export default FloorPlanComments;