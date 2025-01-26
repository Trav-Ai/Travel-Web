const Button = ({ label, onClick, disabled, isAdded, isLiked, isVisited }) => {
    // Determine the background color based on the state
    let backgroundColor = '#0070f3'; // Default color
    if (isAdded) {
      backgroundColor = '#00ff00'; // Highlight color for "added"
    } else if (isLiked) {
      backgroundColor = '#ffcc00'; // Highlight color for "liked"
    } else if (isVisited) {
      backgroundColor = '#ff6600'; // Highlight color for "visited"
    }
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          borderRadius: '8px',
          cursor: 'pointer',
          color: disabled ? 'gray' : backgroundColor,
          border: 'none',
          margin: '5px',
          marginTop: '15px'
        }}
      >
        {label}
      </button>
    );
  };
  
  export default Button;
  