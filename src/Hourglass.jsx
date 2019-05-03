import React, { Component } from 'react';
import 'normalize.css';
import './Hourglass.scss';
import './themes/Day.scss';
import './themes/Twilight.scss';
import './themes/Night.scss';
import 'typeface-frank-ruhl-libre';
import 'typeface-spectral';
import Site from './components/Site/Site';
import LinearClock from './components/LinearClock/LinearClock';
import db from './db.js';

class Hourglass extends Component {
	constructor(props) {
		super(props);
		this.state = {
			date: new Date(),
			offset: 1,
			today_data: [null, null, null, null, null],
			yesterday_data: [null, null, null, null, null],
		};

		this.dateKeeper = this.dateKeeper.bind(this);
		this.offsetChange = this.offsetChange.bind(this);
		this.offsetDate = this.offsetDate.bind(this);
		this.sort_intervals = this.sort_intervals.bind(this)
	}

	dateKeeper() {
		this.setState({
			date: new Date()
		});
	}

	offsetChange(event) {
		this.setState({
			offset: event.target.value
		});
	}

	offsetDate() {
		let date = new Date(this.state.date);
		date.setDate(date.getDate() - this.state.offset);
		return date;
	}

	sort_intervals(data) {
		//console.log(48, data)
		function fromTimestampToValue(timestamp) {
			var delta = timestamp / 1000;
	
			// calculate (and subtract) whole hours
			var hours = Math.floor(delta / 3600) % 24;
			delta -= hours * 3600;
	
			// calculate (and subtract) whole minutes
			var minutes = Math.floor(delta / 60) % 60;
			return {
				hours: hours, 
				minutes: minutes
			}
		}
		
		// key: hostname, value: total time spent at that site
		var map = new Map()
		for (var i=0; i < data.length; i++) {
			var interval = data[i] 
			if (!map.has(interval.hostname)) {
				let time = interval.end - interval.begin
				map.set(interval.hostname, time)
			}
			else {
				let time = map.get(interval.hostname)
				time += interval.end - interval.begin
				map.set(interval.hostname, time)
			}
		}

		var top_keys = []
		var sorted_map = new Map([...map.entries()].sort((a, b) => b[1] - a[1]))
		let iterator = sorted_map.keys();
		for (let i = 1; i <= Math.min(map.size, 5); i++) {
			// iterator.next().value is the key
			var key = iterator.next().value;
			top_keys.push(key)
		}

		function get_intervals(data, hostname) {
			const total_ms = 1000 * 60 * 60 * 24
			function helper(begin, end) {
				var diff = end - begin 

				var e = new Date(begin.getTime());
				var ms = e - begin.setHours(0,0,0,0);
				var left = ms / total_ms 
				left *= 100
				left = left.toString()
				left += "%"

				
				var width = diff / total_ms
				width *= 100
				width = width.toString()
				width += "%"
				return {width: width, left: left}
			}
			var rv = []
			for (var i=0; i < data.length; i++) {
				var interval = data[i]
				if (interval.hostname === hostname) {
					var width_left = helper(interval.begin, interval.end)
					rv.push(width_left)
				}
			}
			return rv
		}

		var new_arr = []
		var color_arr = ["#F7665A", "#8D608C", "#FFB95A", "#4D8FAC", "#8DB255"]
		var color_index = 0
		console.log("top_keys.length: ", top_keys.length)
		for (var i=0; i < top_keys.length; i++) {
			
			key = top_keys[i]
			var each_map = {}
			each_map["url"] = key 
			var h_and_m = fromTimestampToValue(map.get(key))
			each_map["hour"] = h_and_m.hours
			each_map["minute"] = h_and_m.minutes
			each_map["color"] = color_arr[color_index++] 
			each_map["events"] = get_intervals(data, key)
			console.log(key, each_map)
			new_arr.push(each_map)
		}
		this.setState({today_data: new_arr})
		console.log(106, new_arr)
	}


	render() {
		return (
			<div className="main_wrapper">
				<header className="main_header">
					<h1 className="month">{this.state.date.getMonth() + 1}</h1>
					<h2 className="time">
						{this.state.date.toLocaleString(navigator.language, { hour: "numeric", minute: "2-digit" }).replace(/[^0-9:]/g, "").split(/(:+)/).map((elem, i) => (RegExp(/:+/).test(elem)) ? <span key={i} className="colon">{elem}</span> : elem)}
					</h2>
				</header>

				<main>
					<section>
						<header className="section_header">
							<div className="date_day">
								<h2 className="date">{this.state.date.getDate()}</h2>
								<h3 className="day">{this.state.date.toLocaleString(navigator.language, { weekday: "short" })}</h3>
							</div>
						</header>

						<main id="today_log">
						
							<Site url="test.com"
									hour="18" 
									minute= "07"
									
									color= "#EE051155" 
									events= {[{ width: "40%", left: "0%" },{ width: "5%", left: "45%" },{ width: "5%", left: "90%" }]} />
							{/*<Site color="#8D608C" />
							<Site color="#FFB95A" />
							<Site color="#4D8FAC" />
		<Site color="#8DB255" />*/}
						</main>
					</section>

					<section>
						<header className="section_header">
							<div className="date_day">
								<h2 className="date">{this.offsetDate().getDate()}</h2>
								<h3 className="day">{this.offsetDate().toLocaleString(navigator.language, { weekday: "short" })}</h3>
							</div>

							<select id="offset" value={this.state.offset} onChange={this.offsetChange}>
								<option value={1}>1 ← ●</option>
								<option value={2}>2 ← ●</option>
								<option value={3}>3 ← ●</option>
								<option value={4}>4 ← ●</option>
								<option value={5}>5 ← ●</option>
								<option value={6}>6 ← ●</option>
								<option value={7}>7 ← ●</option>
							</select>
						</header>

						<main>

							{/* <Site color="#F7665A" />
							<Site color="#8D608C" />
							<Site color="#FFB95A" />
							<Site color="#4D8FAC" />
							<Site color="#8DB255" /> */}
						</main>
					</section>

					<LinearClock date={this.state.date}/>
				</main>

				<footer className="main_footer"></footer>
			</div>
		);
	}

	componentDidMount() {
		let date = new Date();
		setTimeout(() => {
				setInterval(this.dateKeeper, 1000);
				this.dateKeeper();
			}, (999 - date.getMilliseconds()));
		setInterval(function() {
			console.log(document.getElementById("today_log"))
			console.log("setInt")
		}, 1000 * 60)
		/*
		date = new Date();
		setTimeout(() => {
				setInterval(this.function, 60000);
				this.function();
			}, (59 - date.getSeconds())*1000 + (999 - date.getMilliseconds()));
		*/
		//----------------------------------------------
		function insertNewTimeData(hostname, begin, end) {
			db.time.put({ hostname: hostname, begin: begin, end: end })
		}

		function getTimeEntry() {
			var curr_date = new Date()
			var rv = []
			return  db.time.filter(function(data) {
						return data.begin.toDateString() === curr_date.toDateString()
					})
					.each(function(data) {
					  rv.push(data)
					})
					.then(function() {
					  return rv
					})		
		}

		//this.sort_intervals([1,2,3])
		var func = this.sort_intervals
		const time_interval = 1000
		setInterval(function() {
			var rv = getTimeEntry()
			rv.then((data) =>{
				func(data)
			})
		  }, time_interval)
	}
}

export default Hourglass;