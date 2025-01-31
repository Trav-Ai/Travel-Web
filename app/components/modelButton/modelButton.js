'use client'
import { useState } from 'react';

const ModelButton = ({ userId, onSuccess }) => { // onSuccess is passed as a prop
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleModelExecution = async () => {
    setLoading(true);
    setMessage(''); // Reset message before starting execution

    try {
      // Send POST request to Flask API with user_id
      // const response = await fetch('http://127.0.0.1:5000/execute-model', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ user_id: userId }) // Send user_id from props
      // });


      const response = await fetch('https://ai-recommendation-model.vercel.app/execute-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }) // Send user_id from props
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Model successfully executed!');
        
        // Call onSuccess to notify the parent about the successful execution
        if (onSuccess) {
          onSuccess();  // Trigger the parent's callback to update its state
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to execute the model.');
      }
    } catch (error) {
      setMessage(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleModelExecution} disabled={loading}>
        {loading ? 'Running Model...' : 'Run Model'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ModelButton;
