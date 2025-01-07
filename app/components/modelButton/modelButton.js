'use client'
import { useState } from 'react';

const ModelButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleModelExecution = async () => {
    setLoading(true);
    setMessage(''); // Reset message before starting execution

    try {
      // Send POST request to Flask API
      const response = await fetch('http://127.0.0.1:5000/execute-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Model successfully executed!');
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
