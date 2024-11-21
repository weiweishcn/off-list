   // src/components/LoginForm.js
   import React, { useState } from 'react';

// LoginPage.js
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        password
      })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Store token in localStorage or context
    localStorage.setItem('token', data.token);
    // Redirect or update state
    // navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    setError('An error occurred during login. Please try again.');
  }

     return (
       <form onSubmit={handleSubmit}>
         <input 
           type="text" 
           placeholder="Username" 
           value={username} 
           onChange={(e) => setUsername(e.target.value)} 
         />
         <input 
           type="password" 
           placeholder="Password" 
           value={password} 
           onChange={(e) => setPassword(e.target.value)} 
         />
         <button type="submit">Login</button>
       </form>
     );
   };

   export default LoginPage;