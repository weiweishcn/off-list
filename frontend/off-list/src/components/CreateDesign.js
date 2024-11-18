import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import FileUpload from './FileUpload';

export const CreateDesign = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_2ojs1zm', 'template_is4zoid', form.current, {
        publicKey: 'txupk1NbFN0mcpUCJ',
      })
      .then(
        () => {
          alert("Request sent successfully!");
          console.log('SUCCESS!');
        },
        (error) => {
          alert("FAILED!"+ error);
          console.log('FAILED...', error.text);
        },
      );
  };

  return (
    <div>
    <form ref={form} onSubmit={sendEmail}>
      <label>Name</label>
      <input type="text" name="from_name" />
      <label>Email</label>
      <input type="email" name="user_email" />
      <label>Type of Room</label>
      <input type="text" name="room_type" />
      <label>Length</label>
      <input type="text" name="length" />
      <label>Width</label>
      <input type="text" name="width" />
      <label>Height</label>
      <input type="text" name="height" />
      <label>Color</label>
      <input type="text" name="color" />
      <label>Pattern</label>
      <input type="text" name="pattern" />
      <label>Zip Code</label>
      <input type="text" name="zipcode" />
      <label>Message</label>
      <textarea name="message" />
      <input type="submit" value="Send" />
    </form>
    <div>
      <p> add your home images here</p>
      <FileUpload /> 
    </div>
    <div>
      <p> add your inspiration images here</p>
      <FileUpload /> 
    </div>
    </div>
  );
};

export default CreateDesign;