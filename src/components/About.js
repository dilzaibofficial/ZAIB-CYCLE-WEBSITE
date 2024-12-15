import React from 'react';
import './About.css'; // Import the CSS file for styling
import CEO from './CEO.jpg'
function About() {
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">About Us</h1>
      <p className="text-center">
        Welcome to Awesome Cycles! We offer a wide range of cycles for all your needs. Whether you're looking for a mountain bike, road bike, or a casual ride, we have it all.
      </p>
      <div className="testimonial">
        <img src={CEO} alt="Dil Zaib" className="testimonial-img" />
        <h3>DIL ZAIB</h3>
        <p>CEO</p>
        <p>"Awesome Cycles has the best selection of bikes and the customer service is top-notch. Highly recommended!"</p>
      </div>
      <div className="text-center mt-4">
        <a href="https://github.com/dilzaibofficial" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          View Project on GitHub
        </a>
      </div>
    </div>
  );
}

export default About;
