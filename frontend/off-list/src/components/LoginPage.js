// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
   e.preventDefault();
   
   try {
     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
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
     localStorage.setItem('token', data.token);
     navigate('/dashboard');
   } catch (error) {
     console.error('Login error:', error);
     setError('An error occurred during login. Please try again.');
   }
 };

 return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
     <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow">
       <h2 className="text-3xl font-bold text-center">Sign in to your account</h2>
       {error && (
         <div className="p-4 text-red-700 bg-red-100 rounded">
           {error}
         </div>
       )}
       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <label className="block mb-2 text-sm font-medium text-gray-700">
             Email
           </label>
           <input 
             type="email"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
             required 
           />
         </div>
         <div>
           <label className="block mb-2 text-sm font-medium text-gray-700">
             Password
           </label>
           <input 
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
             required
           />
         </div>
         <button 
           type="submit"
           className="w-full p-3 text-white bg-blue-600 rounded hover:bg-blue-700"
         >
           Sign in
         </button>
       </form>
     </div>
   </div>
 );
};

export default LoginPage;