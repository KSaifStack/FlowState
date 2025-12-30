# colorstackwinterhack2025-[FlowState]
Theme is: Responsible AI
FlowState is a Responsible AI-powered project assistant that supports—not replaces—human decision-making.
It helps users plan, learn, and track projects by analyzing opt-in GitHub activity and natural language goals.
FlowState emphasizes transparency, user control, and explainable recommendations, showing users why suggestions are made and allowing them to pause, modify, or reject AI guidance at any time.
By prioritizing ethical data use, burnout awareness, and human-in-the-loop workflows, FlowState demonstrates how AI can responsibly empower creators rather than automate them.

**NOTE THIS IS JUST A DEMO, DO NOT WORRY ABOUT THE FOLLOWING:** 
- CROSS-PLATFORM DATA SAVES
- Have FlowState affect the user while coding.
  
 TECH STACK: 
 --
- Electron- This allows for native app support and easy access to the native features.
- React - This allows for complex backend logic and makes it easier to make. 
- TailWind CSS- Allows CSS to be used in HTML files. You can make classes, so it won't take up a lot of code. 
- SQL Lite - Store project data based on GitHub user(No need to worry about cross save)((last))
- GitHub Integration- ???(WE need to look into ts)
- AI Integration -???(idk)
  
 UI:
 --
- The app will stay open upon closing and can only be closed when pressed in menu other wise it will stay in system tray.
- On the right side, it should display the username along with the last project they had open and the option to start it.
- on the left should be a list of projects that are on GitHub/on System(if not connected to GitHub or didn't add)
- Add a button on the top right to add projects in case the user does not have GitHub linked.
- (Maybe) an option to add certain projects from GitHub.
- When the project is pressed, it will open a card with AI features inside of it, along with a button to open the previous workflow in one go, rather than opening apps one by one.
- Local users can link their data to GitHub at any time.
- simple yet clean ui design.
- If the user didn't open the project before or through the app, it will prompt them to choose an app of their choice to remember it by.
  (eg: VS Code and if the user pressed VS Code through the app and opens Spotify for music, it will remember VS Code + Spotify.)
- The user should be able to press the icon on the top left to open a menu dialogue in which they can edit settings.
  e.g.: Exit application, future app settings. 

AI FEATURES:
--
**AI suggestions are recommendations, not decisions**
- The AI will recommend projects to work on.
- When pressing a project, it will give you your current tech stack using GitHub and recommended workflows.
- AI should be able to detect how often you commit to projects and warn you over- or under-committing.
  eg: "You’ve been committing late at night for 5 days. Consider pacing"

BACKEND: 
--
- Find a way to get userdata from GitHub onto the app and display project information, profile pic from GitHub, etc.
- Pull GitHub project data to the app so the user can see it and AI, and generate a response to it.
- Take an AI module and get it to display the necessary data for a smart app.
- More stuff should be taken from UI into here, my head is not heading rn. 

Winter Hackathon 2025 Officially Open — Project Repository & Devpost Submission Instructions
Dear Participants, @channel
The hackathon is now officially open. All teams are required to create a GitHub repository for their project. When setting up your repository and submitting your project on Devpost, please use the following required naming format:
Repository name and Devpost project name: colorstackwinterhack2025-[FlowState]
Please ensure that:
The same naming format is used for both the GitHub repository and the Devpost submission
Your GitHub repository is accessible and properly linked in your Devpost project
All final submissions are completed through the official Devpost event page:
colorstackwinterhackathon2025.devpost.com
For full submission requirements, timelines, and evaluation criteria, please follow the Hacker Guide, which outlines all rules and submission details.
Using a consistent naming convention and following the Hacker Guide is required to ensure your submission is eligible for judging. (edited) 
[JoKeRS](https://devpost.com/settings/hackathon-recommendations?return_to=https%3A%2F%2Fcolorstackwinterhackathon2025.devpost.com%2Fregister)



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
