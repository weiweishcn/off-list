import React from 'react';

const ContactForm = () => {
 const handleEmailClick = () => {
   window.location.href = 'mailto:support@pencildogs.com';
 };

 return (
   <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
     <div className="max-w-3xl mx-auto">
       <div className="text-center">
         <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
           Contact Us
         </h2>
         <p className="mt-4 text-lg text-gray-500">
           We'd love to hear from you. Reach us at:
         </p>
         <p className="mt-4 text-xl text-blue-600">
           support@pencildogs.com
         </p>
         <button
           onClick={handleEmailClick}
           className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
         >
           Email Us
         </button>
       </div>
     </div>
   </div>
 );
};

export default ContactForm;