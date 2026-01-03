# [IMPORTANT: PLEASE READ USAGE.md FOR IMPORTANT DETAILS.]

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
 - When adding a project the user should be able to pick if they would like to get a project from there computer or from github.
 - Once picked a file manager will open if local and if they chose github they will be req to paste the link(The project might need to be public idk rn)
 - When adding a project the user will be req to pick what ide or apps to open for the workflow.
 - After that the user will have to set up the workflow the ai should be able to tell the goals of the project depending on the readme so we should push the user to explain     what it is on the readme so it can give goals and reminders otherwise the ai will auto generate goals(should be a off and on thing by the user)
- Once created the user should have a option to see and edit the workflow,open the workflow,see goals and roadmaps for project,commit history,to pin and trash the project
- Keep sleeping like a bum. 
- The app will stay open upon closing and can only be closed when pressed in menu other wise it will stay in system tray.
- Once a project is pressed they should see the following: TechStack,Workflow,Goals(Ai),Insights(Ai),Total commits,Daily commits,Last opened data,Saved Workflow(while being able to edit it)
- The pin and trash feature will be moved inside the project card window.
- On the left side, it should display the username along with the last project they had open and the option to start it.(Done)
- on the right should be a list of projects that are on GitHub/on System(if not connected to GitHub or didn't add)(Done)
- When the project is pressed, it will open a card with AI features inside of it, along with a button to open the previous workflow in one go, rather than opening apps one by one.
- Local users can link their data to GitHub at any time.
- simple yet clean ui design.(Done).
- If the user didn't open the project before or through the app, it will prompt them to choose an app of their choice to remember it by.
  (eg: VS Code and if the user pressed VS Code through the app and opens Spotify for music, it will remember VS Code + Spotify.)
- The user should be able to press the icon on the top left to open a menu dialogue in which they can edit settings.
  e.g.: Exit application, future app settings. 
  - FlowState title on the top left will be replaced with a logo this logo will open a dropdown menu which will open a settings page for the app.

AI FEATURES:
--
**AI suggestions are recommendations, not decisions**
- The AI will recommend projects to work on.
- When pressing a project, it will give you your current tech stack using GitHub and recommended workflows.
- AI should be able to detect how often you commit to projects and warn you over- or under-committing.
  eg: "You’ve been committing late at night for 5 days. Consider pacing"

BACKEND: 
--

**GitHub Integration (Getting data from GitHub):**
- Set up GitHub OAuth so users can login with their GitHub account
- Once logged in, we can access their data using GitHub's API
- We need to get:
  * Username and profile picture (Example: https://github.com/KsaifStack.png)
  * List of all their repositories (projects)
  * For each repo: how many commits they made, what languages/tech they used
  * The README file (so AI can read what the project is about)
- GitHub API Documentation: https://docs.github.com/en/rest
- Important: GitHub limits us to 5000 API requests per hour, so we need to cache data

**AI Integration (Smart suggestions and insights):**
- Pick an AI service: OpenAI API, Claude API, or run a local model
- What the AI needs to do:
  1. Read the project's README file
  2. Generate 3-5 goals/tasks for the user (Example: "Add unit tests", "Improve documentation")
  3. Look at commit history and warn if user is overworking
     - Example: "You've committed at 2am for 5 days straight, take a break!"
  4. Suggest which project to work on based on last opened date
- We need to write clear prompts for the AI like:
  "Based on this README, suggest 3 actionable goals for this project: [README content]"

**SQLite Database (Storing all the data locally):**
- SQLite is a simple database that stores data in a single file on the user's computer
- We need to create tables (like Excel sheets) for:
  
  **Table 1: projects**
  - Columns: id, title, type (local or github), path, icon, isPinned, lastOpened
  - This stores basic info about each project
  
  **Table 2: workflows**
  - Columns: id, projectId, appName (like "VS Code"), appPath (where the app is installed)
  - This remembers which apps to open for each project
  
  **Table 3: commits**
  - Columns: id, projectId, date, dailyCount, totalCount
  - Tracks how many commits per day (resets at midnight)
  
  **Table 4: goals**
  - Columns: id, projectId, goalText, isCompleted, generatedBy (AI or user)
  - Stores project goals and whether they're done
  
  **Table 5: settings**
  - Columns: key, value
  - Stores user preferences like "autoGenerateGoals: true"

**Electron Integration (Making the desktop app work):**
- Electron lets React talk to the computer's file system and apps
- We need to create these functions in Electron's "main process":
  
  1. **window.electron.selectFolder()** 
     - Opens the system file picker so user can choose a project folder
     - Returns the folder path
  
  2. **window.electron.openApps(appPaths)**
     - Takes an array like ["C:/VS Code/code.exe", "C:/Spotify/spotify.exe"]
     - Launches all those apps at once
  
  3. **window.electron.getInstalledApps()**
     - Scans the computer for installed IDEs (VS Code, WebStorm, etc.)
     - Returns a list so user can pick which to use
  
  4. **window.electron.minimizeToTray()**
     - Instead of closing the app, it hides in the system tray
     - User can click the tray icon to bring it back

**Workflow System (Remembering which apps to open):**
- When user first opens a project, ask them: "Which apps do you want to open?"
- Let them select VS Code, Spotify, browser, etc.
- Store these in the "workflows" table
- When they click "Open Workflow" button, launch all those apps automatically
- Also track if they open OTHER apps while working (like if they open Discord)
  - After a few times, ask: "I noticed you always open Discord with this project, add it to workflow?"

**Daily Commit Counter (Tracking productivity):**
- Every time we fetch commits from GitHub, check the date
- If commit was made TODAY (compare dates), add to dailyCount
- Store in commits table like: projectId=1, date="2025-01-01", dailyCount=5
- At midnight, reset dailyCount to 0 (can use a scheduled task or check on app startup)
- Show user: "You've committed 5 times today!" in the project detail view

**Tech Stack Detection (Figuring out what languages are used):**
- GitHub API has an endpoint: /repos/:owner/:repo/languages
- It returns something like: {"JavaScript": 45000, "CSS": 12000, "HTML": 8000}
- The numbers are bytes of code
- Convert to percentages and show: "JavaScript 69%, CSS 18%, HTML 13%"
- Display in the project detail modal

**README Parser (So AI can understand the project):**
- Fetch README from GitHub: /repos/:owner/:repo/contents/README.md
- For local projects, read the README.md file from the project folder
- Send README text to AI with a prompt like:
  "Based on this project description, generate 3-5 specific, actionable goals: [README content]"
- Parse AI response and save to the goals table
- If there's no README, AI generates generic goals based on tech stack

**Setup Guide for YOU:**
1. Learn Electron basics: https://www.electronjs.org/docs/latest/tutorial/quick-start
2. Learn GitHub API: https://docs.github.com/en/rest/quickstart
3. Learn SQLite with better-sqlite3: https://github.com/WiseLibs/better-sqlite3
4. Pick an AI service and get API key (OpenAI is easiest to start)
5. Set up Electron IPC for communication between React and Node.js

**Testing Plan:**
- First get GitHub OAuth working and display user profile pic
- Then fetch one repo's data and display it
- Set up SQLite and store one project manually
- Get Electron file picker working
- Test launching one app (like VS Code)
- Then add AI features last (they're optional for MVP)

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
