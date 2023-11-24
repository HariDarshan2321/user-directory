import React, { useState, useEffect, useRef } from 'react';
import './css/styles.css';

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const useWorldTime = (initialTime, clockRunning, timezone) => {
  const [time, setTime] = useState(initialTime || getCurrentTime());
  const pausedTimeRef = useRef({ current: initialTime });

  useEffect(() => {
    let intervalId;

    if (clockRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          // Increment the time by 1 second
          const [hours, minutes, seconds] = prevTime.split(':').map(Number);
          const newSeconds = (seconds + 1) % 60;
          const newMinutes = minutes + Math.floor((seconds + 1) / 60);
          const newHours = hours + Math.floor(newMinutes / 60);
          return `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`;
        });
      }, 1000);
    } else {
      clearInterval(intervalId);
      pausedTimeRef.current = { current: time };
    }

    return () => clearInterval(intervalId);
  }, [clockRunning, time]);

  useEffect(() => {
    const fetchTime = async () => {
      if (timezone) {
        try {
          const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
          const data = await response.json();

          // Extract time from the API response
          const timeString = data.datetime.split('T')[1].split('.')[0];
          setTime(timeString);
        } catch (error) {
          console.error('Error fetching current time:', error);
        }
      }
    };

    fetchTime();
  }, [timezone, clockRunning]);

  return { time, pausedTimeRef };
};

const Post = ({ post, onClick }) => {
  return (
    <div className="post" onClick={() => onClick(post)}>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  );
};

const Popup = ({ post, onClose }) => {
  if (!post) {
    return null;
  }

  return (
    <div className="popup" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </div>
    </div>
  );
};

const UserDetail = ({ user }) => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [clockRunning, setClockRunning] = useState(true);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [initialTime, setInitialTime] = useState(null);

  useEffect(() => {
    fetch('https://worldtimeapi.org/api/timezone')
      .then(response => response.json())
      .then(data => setCountries(data))
      .catch(error => console.error('Error fetching countries:', error));

    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`)
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('Error fetching user posts:', error));
  }, [user.id]);

  const { time, pausedTimeRef } = useWorldTime(initialTime, clockRunning, timezone);

  const toggleClock = () => {
    setInitialTime(clockRunning ? pausedTimeRef.current || time : null);
    setClockRunning(prevState => !prevState);
  };

  useEffect(() => {
    const fetchCountryTimezone = async () => {
      if (selectedCountry) {
        try {
          const response = await fetch(`https://worldtimeapi.org/api/timezone/${selectedCountry}`);
          const data = await response.json();
          setTimezone(data.timezone);
        } catch (error) {
          console.error('Error fetching timezone:', error);
        }
      }
    };

    fetchCountryTimezone();

  }, [selectedCountry, clockRunning]);

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setSelectedCountry(selectedCountry);
    setInitialTime(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleClosePopup = () => {
    setSelectedPost(null);
  };

  return (
    <div>
      <div className="upper-segment">
        <div className="country-selector">
          <label htmlFor="country">Select Country:</label>
          <select id="country" value={selectedCountry} onChange={handleCountryChange}>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div className="clock-section">
          <h2>Digital Clock</h2>
          <div className="clock" style={{ backgroundColor: '#c7ecee' }}>{time}</div>
          <button onClick={toggleClock}>{clockRunning ? 'Pause' : 'Start'}</button>
        </div>
      </div>
      <div className="user-details">
        <div className="user-info">
          <div className="user-name">Username: {user.name}</div>
          <div className="user-catch-phrase">User Catch Phrase: {user.company.catchPhrase}</div>
        </div>
        <div className="user-contact">
          <div>
            <div className="contact-label">Name:</div>
            <div className="contact-info">{user.username}</div>
          </div>
          <div>
            <div className="contact-label">Address:</div>
            <div className="contact-info">{user.address.city}, {user.address.street}</div>
          </div>
          <div>
            <div className="contact-label">Email:</div>
            <div className="contact-info">{user.email}</div>
          </div>
          <div>
            <div className="contact-label">Phone:</div>
            <div className="contact-info">{user.phone}</div>
          </div>
        </div>
      </div>
      <h2>User Posts</h2>
      <div className="posts-container">
        {posts.map(post => (
          <Post key={post.id} post={post} onClick={handlePostClick} />
        ))}
      </div>
      <Popup post={selectedPost} onClose={handleClosePopup} />
    </div>
  );
};

export default UserDetail;
