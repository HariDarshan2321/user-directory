import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import UserDetail from './UserDetail';
import './css/styles.css';

function UserProfile({ match }) {
  const userId = parseInt(match.params.userId, 10);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then(response => response.json())
      .then(userData => setUser(userData));
  }, [userId]);

  return (
    <div>
      <h1>User Profile</h1>
      <Link to="/" className="back-button">Back</Link>
      {user && <UserDetail user={user} />} {/* Pass the user data to UserDetail component */}
    </div>
  );
}

export default UserProfile;
