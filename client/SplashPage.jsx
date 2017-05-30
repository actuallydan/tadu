import React, {Component} from 'react';

export default class SplashPage extends Component {
	componentDidMount(){
		(function () {var lastTime = 0; var vendors = ['webkit', 'moz']; for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']; window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']; } if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {var currTime = new Date().getTime(); var timeToCall = Math.max(0, 16 - (currTime - lastTime)); var id = window.setTimeout(function () {callback(currTime + timeToCall); }, timeToCall); lastTime = currTime + timeToCall; return id; }; if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {clearTimeout(id); }; }()); /* setup stuff */ var canvas = document.getElementById("splashCanvas"), ctx = canvas.getContext("2d"), settings = {background: "#242424", traceColor: "#FFF", traceFill: "#000000", startTraces : 50, totalTraces : 50, redraw: function () {reinit(); } }; canvas.width = window.innerWidth; canvas.height = window.innerHeight; function Trace(settings) {settings = settings || {}; this.x = window.innerWidth / 2; this.y = window.innerHeight / 2; this.points = []; this.points.push({x: this.x, y: this.y, arc: 0 }); this.trapCount = 0; this.live = true; this.lastPoint = this.points[0]; this.angle = settings.angle || (Math.ceil((Math.random() * 360) / 45) * 45) * (Math.PI / 180); this.speed = 2; } Trace.prototype.update = function () {var x = this.lastPoint.x, y = this.lastPoint.y, dx = this.x - x, dy = this.y - y; /* if its greater than .01 keep moving */ if (Math.random() > 0.01) {var velX = Math.cos(this.angle) * this.speed, velY = Math.sin(this.angle) * this.speed, checkPointX = this.x + (Math.cos(this.angle) * 8), checkPointY = this.y + (Math.sin(this.angle) * 8), imageData = ctx.getImageData(checkPointX, checkPointY, 3, 3), pxlData = imageData.data, collision = false; /* check if its in bounds. */ if (checkPointX > 0 && checkPointX < window.innerWidth && checkPointY > 0 && checkPointY < window.innerHeight) {/* check if the point in front is clear or not. */ for (var i = 0, n = pxlData.length; i < n; i += 4) {var alpha = imageData.data[i + 3]; if (alpha !== 0) {collision = true; break; } } } else {collision = true; } /* no collision keep moving */ if (!collision) {this.trapCount = 0; this.x += velX; this.y += velY; } else {/* collision, assume its not the end */ this.trapCount++; this.angle -= 45 * (Math.PI / 180); /* line is fully trapped make sure to draw an arc and start a new trace.  */ if (this.trapCount >= 7) {this.live = false; if (traces.length < settings.totalTraces) {traces.push(new Trace({cX: 0, cY: 0 })); } } if (Math.sqrt(dx * dx + dy * dy) > 4) {this.points.push({x: this.x, y: this.y }); this.lastPoint = this.points[this.points.length - 1]; } else {this.trapCount++; this.x = this.lastPoint.x; this.y = this.lastPoint.y; } } } else {/* small chance we might just stop altogether. */ if (Math.random() > 0.8) {this.live = false; } /* no collision clear any prev trap checks, change the direction and continue on. */ this.trapCount = 0; this.angle += 45 * (Math.PI / 180); if (Math.sqrt(dx * dx + dy * dy) > 4) {this.points.push({x: this.x, y: this.y }); this.lastPoint = this.points[this.points.length - 1]; } else {this.x = this.lastPoint.x; this.y = this.lastPoint.y; } } }; Trace.prototype.render = function () {ctx.beginPath(); ctx.moveTo(this.points[0].x, this.points[0].y); for (var p = 1, plen = this.points.length; p < plen; p++) {ctx.lineTo(this.points[p].x, this.points[p].y); } ctx.lineTo(this.x, this.y); ctx.stroke(); ctx.beginPath(); ctx.arc(this.points[0].x, this.points[0].y, 4, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke(); if (!this.live) {ctx.beginPath(); ctx.arc(this.points[plen - 1].x, this.points[plen - 1].y, 4, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke(); } }; /* init */ var traces = [], traceNum = settings.startTraces, reqAnimFrameInstance = null; for (var b = 0; b < traceNum; b++) {traces.push(new Trace({cX: 0, cY: 0 })); } ctx.strokeStyle = "#FFF"; ctx.fillStyle = "#242424"; ctx.lineWidth = 1; function reinit() {cancelAnimationFrame(reqAnimFrameInstance); traces = []; traceNum = settings.startTraces; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); for (var b = 0; b < traceNum; b++) {traces.push(new Trace({cX: 0, cY: 0 })); } doTrace(); } function doTrace() {ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); for (var b = 0; b < traces.length; b++) {traces[b].render(); } for (b = 0; b < traces.length; b++) {if (traces[b].live) {traces[b].update(); } } reqAnimFrameInstance = requestAnimationFrame(doTrace); } doTrace();
	}
	render(){
		return(
			<div className="wrapper">
			<div id="first-container" className="container">
			<div id="nav">
			<img src="../img/untitled.png" id="nav-logo" />
			<button id="to-login" onClick={this.props.showLogin.bind(this)}>LOGIN</button>
			</div>
			<video loop muted autoPlay poster="../img/Underground-Traffic.jpg" preload="true">
			<source src="../img/Underground-Traffic.mp4" type="video/mp4" />
			</video>
			<canvas id="splashCanvas"></canvas>
			<div id="splash">TADU</div>
			<div id="by-line">
			Spend less time scheduling. More time on yourself.
			<br/>
						<div className="mdi mdi-chevron-down" onClick={()=>{document.getElementById('learn').scrollIntoView({ behavior: "smooth"});}}></div>

			</div>
			</div>
			<div className="container" id="learn">
			<div className="container-by-line">Tadu helps you build a better schedule.</div>
			<div className="responsive-card">
			<div className="card-icon mdi mdi-account-circle"></div>
			<div className="card-byline">Tadu works with you</div>
			<div className="card-desc">Based on your "body clock" and daily routine, Tadu suggests times where you're much more likely to complete a task</div>
			</div>
			<div className="responsive-card">
			<div className="card-icon mdi mdi-chart-line"></div>
			<div className="card-byline">Procrastinate Smarter</div>
			<div className="card-desc">Tadu recognizes your daily achievements and helps you accomplish them when you're at your peak. Giving you peace of mind if you're in a rut.</div>
			</div>
			<div className="responsive-card">
			<div className="card-icon mdi mdi-tag-outline"></div>
			<div className="card-byline">Morning or Night Person?</div>
			<div className="card-desc">You're better at some things than others at different times. Tadu builds your schedule around what type of task you need to create.</div>
			</div>
			</div>
			<div className="container full-width">
			<div className="seventy-five">
			<div className="card-byline">Tadu is Sensible</div>
			<div className="card-desc">
			Obviously you can't exercise if you're at work or in class, even if that's the best time to do it. 
			Tadu knows that. Tasks are set around your daily routine, which you set once and change as needed.
			</div>
			</div>
			<div className="twenty-five">
			<div className="card-icon mdi mdi-timetable"></div>

			</div>
			</div>
			<div className="container full-width">
			<div className="twenty-five">
			<div className="card-icon mdi mdi-television-guide"></div>

			</div>
			<div className="seventy-five">
			<div className="card-byline">No Clunky Menus</div>
			<div className="card-desc">
			Unlike many calendar apps, Tadu uses a minimalist interface to show only what you really want (what you really REALLY want). 
			Whether you're creating a new task, checking notifications, changing your username, updating a task, or setting a new daily schedule, everything is nearby.
			</div>
			</div>
			
			</div>
			<div className="container full-width">
			<div className="seventy-five">
			<div className="card-byline">Realtime Task Management</div>
			<div className="card-desc">
			Tadu is resilient and realtime. If you lose connection temporarily, Tadu keeps track of changes and makes them available immediately across all of your devices and intelligently manages changes.
			</div>
			</div>
			<div className="twenty-five">
			<div className="card-icon mdi mdi-timetable"></div>
			</div>
			</div>
			<div className="container call-to-action">
			<div className="container-by-line">Start using the smartest productivity platform today.</div>
			<button className="call-to-action-button" onClick={this.props.showLogin.bind(this)}>Get Started</button>
			</div>
			</div>
			)
	}
}