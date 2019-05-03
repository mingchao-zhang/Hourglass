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
			today_data: [],
			prev_data: []
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

	sort_intervals(data, is_today_data) {
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
		for (var i=0; i < top_keys.length; i++) {
			
			key = top_keys[i]
			var each_map = {}
			each_map["url"] = key 
			var h_and_m = fromTimestampToValue(map.get(key))
			each_map["hour"] = h_and_m.hours.toString()
			each_map["minute"] = h_and_m.minutes.toString()
			each_map["color"] = color_arr[color_index++] 
			each_map["events"] = get_intervals(data, key)
			new_arr.push(each_map)
		}

		if (is_today_data) {
			this.setState({today_data: new_arr})
		}
		else {
			this.setState({prev_data: new_arr})
		}
	}


	render() {
		let firstListSites = this.state.today_data.map((data) => 
		 	<Site url={data.url} hour={data.hour} minute={data.minute} color={data.color} events={data.events} />
		)
		let secondListSites = this.state.prev_data.map((data) => 
		 	<Site url={data.url} hour={data.hour} minute={data.minute} color={data.color} events={data.events} />
		)
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

						<main>
						{firstListSites}
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
							{secondListSites}
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

		function getTimeEntry(date) {
			var rv =[]
			var queryDate = new Date(date)
			return  db.time.filter(function(data) {
						return data.begin.toDateString() === queryDate.toDateString()
					})
					.each(function(data) {
					  rv.push(data)
					})
					.then(function() {
					  return rv
					})		
		}
		// func is a copy is this.sort_intervals
		var func = this.sort_intervals
		//const ms_one_day = 1000 * 60 * 60 * 24
		
		function update_page() {
			var first_date = new Date()
			var first_rv = getTimeEntry(first_date)
				first_rv.then((data) =>{
					func(data, true)
			})
			
			let offset = document.getElementById("offset").value
			let second_date = first_date
			second_date.setDate(second_date.getDate() - parseInt(offset));
			let second_rv = getTimeEntry(second_date)
				second_rv.then((data) =>{
					func(data, false)
			})
			
		}
		//var begin = new Date('2019/05/01 03:00:05');
		//var end = new Date('2019/05/01 05:04:05');
		//insertNewTimeData("test1.com", begin, end)
		update_page()
			

		const time_interval = 1000 // * 5
		setInterval(update_page, time_interval)
	}
}

export default Hourglass;