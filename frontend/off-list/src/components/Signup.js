   import React, { useState } from 'react';

   const Signup = () => {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');

     const handleSubmit = async (event) => {
       event.preventDefault();

       try {
         const response = await fetch('http://localhost:3001/api/signup', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ username, password }),
         });

         if (response.ok) {
          console.log(response.token);
           // Successful login, redirect to dashboard or other page
           window.location.href = '/dashboard';
         } else {
           // Handle login errors
         }
       } catch (error) {
         console.error('Login error:', error);
       }
     };

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

export default Signup;