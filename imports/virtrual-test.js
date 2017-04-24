import React from 'react';
import {render} from 'react-dom';
import VirtualList from 'react-tiny-virtual-list';
import moment from 'moment';

const get20Years = ()=>{
	var allYears = [];
	for(var i = 12; i > 0; i--){ 
		allYears.push(moment().subtract(i, "months")) 
	} 
		allYears.push(moment()); 
		for(var i = 0; i < 12; i++){ 
			allYears.push(moment().add(i, "months")) 
	} 
		return allYears ;
	};

const data = get20Years();
 
const style = {
	color: "#0090ff",
	backgroundColor: "#242424"
};

var today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10);
		var selectedDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toJSON().substring(0, 10);
		var monthShowing = new Date();
		var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var months = 
function generateMonth (_month, _year) {var daysBefore = new Date(_year, _month, 1).getDay() ; var tempCal = {}, newHTML = "<div class='month-wrapper'>"; for(var i = daysBefore; i > 0; --i){tempCal[new Date(_year, _month, -1 * i + 1).toJSON().substring(0, 10)] = {events : [] }; } for(var i = 0; i < 35 + (7 - daysBefore); i++){tempCal[new Date(_year, _month, 1 + i).toJSON().substring(0, 10)] = {events : [] }; } /* To iteratively index into cal obj */ var _calArray = Object.keys(tempCal); /* Create calendar days with Day components, each has it's own style depending on whether its in the month, is selected, or is today */ _calArray.map(function(day){var _inThisMonth = parseInt(day.substring(5, 7)) === monthShowing.getMonth() + 1 ? true : false; var _isToday = day === today ? true : false; var _isSelected = day === selectedDate ? true : false; var _dayStyles = {color: !_inThisMonth ? "#424242" : !_isToday ? "#FFF" : _isSelected ? "#FFF" : "#1de9b6", borderWidth: 1, zIndex: !_inThisMonth ? -1 : 2, borderStyle: 'solid', borderColor: _isSelected ? "#1de9b6" : "transparent", backgroundColor: _isToday && _isSelected ? "#1de9b6" : "transparent", width : "calc(100% / 7 - 2px)", }; newHTML += "<div class='day' style='color: " + _dayStyles.color + "; z-index: "+_dayStyles.zIndex+"' id='day-"+day+"' data-date='"+day+"' onclick='scrollEmUp(this)'>" + day.substring(8, 10) + "</div>"; } ); newHTML += "</div>"; return newHTML;
	} /* end generateMonth */
render(
  <VirtualList
    width='100%'
    height={window.innerHeight * data.length}
    itemCount={data.length}
    itemSize={window.innerHeight}
    scrollToIndex={parseInt( data.length / 2 )}
    renderItem={({index, style}) =>
      <div key={index} style={style}>
        Letter: {data[index].format("YYYY-MM")}
      </div>
    }
  />,
  document.getElementById('root')
);