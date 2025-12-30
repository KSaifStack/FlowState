import { useState } from 'react';
import './App.css'
import darkPin from './assets/images/darkPin.png';
import darkAdd from './assets/images/darkAdd.png';
import darkTrash from './assets/images/darkTrash.png'
function App() {
  const projects = [
    {
      id: 1,
      icon: '🎮',
      iconClass: 'godot-icon',
      ProjectType: 'Local Project',
      title: 'The Amazing Gorgonzola',
      subtitle: 'RPG Adventure',
      date: 'Last Opened: Over 5 days ago',
      status: ' Your at a good pace keep up the good work!'
    },
    {
      id: 2,
      icon: '⚠️',
      iconClass: 'warning-icon-emoji',
      ProjectType: 'Local Project',
      title: 'CodingAssignment3.cpp',
      subtitle: 'Portfolio Site',
      date: 'Last Opened: Dec 15, 2024',
      status: 'You have been commiting a lot overnight consider taking a break!'
    },
    {
      id: 3,
      icon: '💀',
      iconClass: 'skull',
      ProjectType: 'Local Project',
      title: 'Christmas_Video_Project',
      subtitle: 'Mobile App Prototype',
      date: 'Last Opened: Nov 2, 2024',
      status: 'You have stopped working on this project for awhile would you like to remove it?'
    },
  
  ];
  return (
<div className = "main-content">
  <div className ="left-panel ">
    <div className ="greeting">Hey, <span className="username">[USER]</span>          </div>
    <p className ="Mess">
      It’s been a while since you’ve touched your <strong>CodingAssignment3.cpp</strong>, 
      why don’t we have a crack at it today?
    </p>
  <button className="bigbutton">
  Open <br/> CodingAssignment3.cpp
</button>
  </div>
  <div className="right-panel">
    <div className ="toolbar">
     <div className="button-container">
    <button className="Pinbutton">
      <img id="buttonImage" src={darkPin} ></img>
    </button>
    <button className ="Addbutton">
      <img id="buttonImage" src={darkAdd} >
      </img>
    </button>
    <button className ="Trashbutton">
      <img id="buttonImage" src={darkTrash} >
      </img>
    </button>
      
    </div>
    <button className ="sort-button">
      Sort by: Name (A-Z) <span className="arrow">▼</span>
    </button>
    </div>


    <div className="project-info">
        <div className="project-list">
           {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className={`project-icon ${project.iconClass}`}>
                {project.icon}
              </div>
              <div className="project-info">
                <div className="project-title">{project.title}</div>
                <div className="project-type">{project.ProjectType}</div>
                <div className="project-subtitle">{project.subtitle}</div>
                <div className="project-date">{project.date}</div>
                <div className="project-status">{project.status}</div>
                </div>
            </div>
          ))}
          </div>
        </div>
          </div>
        </div>
    
  )
}

export default App;