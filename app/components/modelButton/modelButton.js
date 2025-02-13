'use client'
import { useState } from 'react';
import styles from './modelButton.module.css';
import ButtonLoader from './buttonloader';
import Image from 'next/image';



const ModelButton = ({ userId, onSuccess }) => { // onSuccess is passed as a prop
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleModelExecution = async () => {
    setLoading(true);
    setMessage(''); // Reset message before starting execution

    try {

      setTimeout(() => {
        setMessage('Collecting user information...');
      }, 4000); // After 2 seconds, change the message to "Executing model..."

      setTimeout(() => {
        setMessage('Retrieving dataset...');
      }, 7000);

      setTimeout(() => {
        setMessage('Analyzing similar locations...');
      }, 15000);

      setTimeout(() => {
        setMessage('Identifying matching users...');
      }, 18000);

      setTimeout(() => {
        setMessage('Executing model algorithms...');
      }, 20000);

      setTimeout(() => {
        setMessage('Finalizing results...');
      }, 22000);


      // Send POST request to Flask API with user_id
      const response = await fetch('//13.126.69.100:5000/execute-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID: userId }) // Send user_id from props
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
        setLoading('false');
      }
    } catch (error) {
      setMessage(`An error occurred: ${error.message}`);
      setLoading('false');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonComponenet}>
        {loading && <div className={styles.buttonLoader}><ButtonLoader /></div>}
        <button onClick={handleModelExecution} disabled={loading} className={styles.button}>
          {loading ? 'Running Model...' : 'Refresh'}
          <Image src='/images/info-icon.png' alt='info-icon' width={20} height={20} className={styles.icon}/>
          <span className={styles.tooltip}>Click to run the model!</span>
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ModelButton;
