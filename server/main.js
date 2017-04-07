import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  if(TagTypes.find().fetch().length === 0){
  	console.log("TAG STATUS: 404 -- Default Tags Missing", "Attempting to populate tags");
  	defaultTags.map((tag)=>{
  		TagTypes.insert({
  			type: tag,
  			uses: 0
  		});
  	});
  } else {
  	console.log("TAG STATUS: 200 -- Default Tags Set");
  }
});


let defaultTags = ["Take a Nap","Take Out Trash","Work on Paper","Homework","Group Study","Tutoring","Dinner","Lunch","Breakfast","Weight Training","Study","Work Meeting","Go Running","Do dishes","Go Out to Eat","Get a Haircut","Doctor Appointment","Conference","Groceries","Pet Supplies","Office Party","School Meeting","Work on Poster","Work on Project","Group Project","Fill Up Tank"];