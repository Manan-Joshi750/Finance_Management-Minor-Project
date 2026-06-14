import React from 'react';
// Removed FaLinkedin, added FaLightbulb for Mayank
import { FaGithub, FaCode, FaServer, FaPaintBrush, FaLightbulb } from 'react-icons/fa';

const About = () => {
  const teamMembers = [
    {
      name: "Manan Joshi", 
      role: "Lead Developer & Architect",
      description: "Designed the system architecture, built the React frontend, developed the Node/Express APIs, and maintained the entire project codebase.",
      github: "https://github.com/Manan-Joshi750", 
      icon: <FaCode className="text-blue-500 mb-2" size={24} />,
      isLead: true
    },
    {
      name: "Vanshika Monga", 
      role: "Project Contributor",
      description: "Assisted with project documentation, presentation structuring, and system testing.",
      github: "https://github.com/Vanshika231",
      icon: <FaPaintBrush className="text-purple-500 mb-2" size={24} />,
      isLead: false
    },
    {
      name: "Sandeep Singh", 
      role: "Project Contributor",
      description: "Contributed to UI/UX conceptualization and requirement gathering.",
      github: "https://github.com/Sandeep-Singh1702",
      icon: <FaServer className="text-indigo-500 mb-2" size={24} />,
      isLead: false
    },
    {
      name: "Mayank Sharma", 
      role: "Project Contributor",
      description: "Contributed in the project documentation and presented crafty ideas.",
      github: "https://github.com/Mayank27800",
      // Added a unique lightbulb icon for the 'crafty ideas' description
      icon: <FaLightbulb className="text-yellow-500 mb-2" size={24} />, 
      isLead: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-10 text-white shadow-xl text-center">
        <h1 className="text-4xl font-extrabold mb-4">About FinTrack</h1>
        <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
          FinTrack was developed as a comprehensive Minor Project to solve the complexities of personal wealth management. 
          By combining intuitive UI design with robust MERN stack architecture, FinTrack empowers users to track their expenses, 
          forecast future spending, and adhere to the golden 50-30-20 budgeting rule seamlessly.
        </p>
      </div>

      {/* Team Section */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Meet the Team</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Updated Grid: 1 col on mobile, 2 cols on tablets, 4 cols on desktops */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg flex flex-col ${
                member.isLead ? 'border-blue-400 ring-2 ring-blue-50 relative transform lg:-translate-y-2' : 'border-gray-100'
              }`}
            >
              {member.isLead && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
                  Core Maintainer
                </div>
              )}
              
              <div className="flex flex-col items-center text-center h-full">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${member.isLead ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className={`text-sm font-semibold mb-4 ${member.isLead ? 'text-blue-600' : 'text-gray-500'}`}>
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-6 flex-grow">
                  {member.description}
                </p>
                
                {/* Icons Container aligned to bottom */}
                <div className="flex space-x-4 mt-auto pt-4">
                  <a 
                    href={member.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <FaGithub size={22} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;