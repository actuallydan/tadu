# Tadu 
## Be More Productive With Sensible Intelligence
### Current Build Version : 0.5
#### Technologies & Tools:
1. React
2. Meteor
3. MongoDB
4. Electron
5. React Native
6. XCode & iOS Simulator
7. Heroku
8. AnimateCSS (https://daneden.github.io/animate.css/)
9. Material Design Icons (https://materialdesignicons.com/)
10. SweetAlert (https://www.npmjs.com/package/sweetalert)
11. React-Tooltip (https://github.com/wwayne/react-tooltip)
12. Meteor Electron (https://github.com/electron-webapps/meteor-electron)

#### Version Roadmap
* 0.0.0.0.5 Replace "Event" with "Task" 
* 0.1 Basic Schedule Function
	* Basic CRUD functions by tags 
* 0.2 Schedule Functions Update 1
	* Add customization to tags
* 0.3 Schedule Functions Update 2
	* Ability to create new tags
	* Suggest/Enforce use of exisiting tags
* 0.5 Sensibility Integration
	* Integrate SI Learning to Optimize Task Scheduling
	* Prioritize Soonest, Most Efficient Time-Slot
* 1.0 Heroku Deployed Meteor Server and Web App 
* 1.2 iOS App deployed using Meteor backend
* 1.2.5 Android deployed using Meteor backend
* 1.3 Electron App for Windows, MacOS, Linux
* 1.4 Migration of Server
	* VPS or Dedicated Heroku Server
* 1.5 Full Release
* 1.6 Sensibility Update 
	* Create Repeated Tasks Automatically 
* 1.7 Sensibility Update 
	* Optimizer considers context of prospective task before and after time slot
* 1.7.1 Sensibility Update 
	* Habits (Superlatives)
* 2.0 Share & Assign Tasks
	* Task Chat (see Meteor Pigeon)
* 2.1 Location Aware
	* May access location to learn daily behavior
		* This will later be used to optimize schedule consider time/distance efficiency
	* Routing to Task-Completers
		* Grades Task-Completers on frequency of ability to complete a user's task
* 2.2 Tadu chatbot
* 3.0 Enterprise Productivity Platform
* 3.5 Voice to Task 
* 4.0 Embedded Tadu List 
* 5.0 Tadu Concierge 

#### What Needs Done
* Improvements
	* Reduce Redundancy in MonthView where creating calObject
------------ For Next Version
* Refactor convert AddTask 1 & 2 to stateless and move refs to state in AddTask.jsx
* Make Cron job easier on server (on task create add to notifications and have notifications only show if they are older than now)
* Recurring Tasks
* Add schedule and tagtypes index to user profile
* Speed up addTag method (currently ~170ms from client)
* Test to see if Schedule needs to subscribe --> can be stateless?
* iOS 
	* Splash screen
* Ionicons
* Share Tasks
* Get NEXT best time in addTask (return whole array and not just one) 


