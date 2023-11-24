import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import UserProfile from './UserProfile';
import './css/styles.css';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch user data
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(usersData => setUsers(usersData));
  }, []);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={() => <UserDirectory users={users} />} />
          <Route path="/user/:userId" component={UserProfile} />
        </Switch>
      </div>
    </Router>
  );
}

function UserDirectory({ users }) {
  useEffect(() => {
    // Fetch posts for each user
    users.forEach(user => {
      fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`)
        .then(response => response.json())
        .then(posts => {
          const postCount = posts.length;
          document.getElementById(`postCount${user.id}`).textContent = `Posts: ${postCount}`;
        });
    });
  }, [users]);

  return (
    <div>
      <h1>User Directory</h1>
      <div className="user-list">
        {users.map(user => (
          <Link key={user.id} to={`/user/${user.id}`} className="user-card">
            <div className="user-info">
              <div className="user-name">Name:{user.name}</div>
              <div className="post-count" id={`postCount${user.id}`}>Posts: Loading...</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}



export default UserList;
