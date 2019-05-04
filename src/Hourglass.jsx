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
import {dateEvents} from './database.js';
import browser from 'webextension-polyfill';
import SunCalc from 'suncalc';

class Hourglass extends Component {
	constructor(props) {
		super(props);
		this.state = {
			date: new Date(),
			offset: 1,
			timeline: Array(5).fill({
				url_hostname: undefined,
				hour: undefined,
				minute: undefined,
				events: []
			}, 0, 5),
			offset_timeline: Array(5).fill({
				url_hostname: undefined,
				hour: undefined,
				minute: undefined,
				events: []
			}, 0, 5),
			latitude: 0,
			longitude: 0
		};

		browser.storage.local.get(["latitude", "longitude"])
			.then(result => {
				this.state.latitude = result.latitude;
				this.state.longitude = result.longitude;
			});

		this.dateKeeper = this.dateKeeper.bind(this);
		this.offsetChange = this.offsetChange.bind(this);
		this.offsetDate = this.offsetDate.bind(this);
		this.calculateTimeline = this.calculateTimeline.bind(this);
		this.updateTheme = this.updateTheme.bind(this);
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

	async calculateTimeline() {
		// Update the state.
		this.setState({
			timeline: await dateEvents(this.state.date),
			offset_timeline: await dateEvents(this.offsetDate())
		});
	}

	updateTheme() {
		this.setState({
			SunCalc: SunCalc.getTimes(this.state.date, this.state.latitude, this.state.longitude)
		});
		let hourglass = document.getElementById("Hourglass");
		// Night.
		if (this.state.date > this.state.SunCalc.nauticalDusk || this.state.date <= this.state.SunCalc.nauticalDawn) {
			hourglass.className = "night_theme";
		}
		// Twilight (morning).
		else if (this.state.date > this.state.SunCalc.nauticalDawn && this.state.date <= this.state.SunCalc.sunriseEnd) {
			hourglass.className = "twilight_theme";
		}
		// Day.
		else if (this.state.date > this.state.SunCalc.sunriseEnd && this.state.date <= this.state.SunCalc.sunsetStart) {
			hourglass.className = "day_theme";
		}
		// Twilight (evening).
		else if (this.state.date > this.state.SunCalc.sunsetStart && this.state.date <= this.state.SunCalc.nauticalDusk) {
			hourglass.className = "twilight_theme";
		}
	}

	componentDidUpdate (prevProps, prevState) {
		if (prevState.offset !== this.state.offset) {
			this.calculateTimeline();
		}
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

						<main>
							<Site color="#F7665A" url={this.state.timeline[0].url_hostname} hour={this.state.timeline[0].hour} minute={this.state.timeline[0].minute} events={this.state.timeline[0].events} />
							<Site color="#8D608C" url={this.state.timeline[1].url_hostname} hour={this.state.timeline[1].hour} minute={this.state.timeline[1].minute} events={this.state.timeline[1].events} />
							<Site color="#FFB95A" url={this.state.timeline[2].url_hostname} hour={this.state.timeline[2].hour} minute={this.state.timeline[2].minute} events={this.state.timeline[2].events} />
							<Site color="#4D8FAC" url={this.state.timeline[3].url_hostname} hour={this.state.timeline[3].hour} minute={this.state.timeline[3].minute} events={this.state.timeline[3].events} />
							<Site color="#8DB255" url={this.state.timeline[4].url_hostname} hour={this.state.timeline[4].hour} minute={this.state.timeline[4].minute} events={this.state.timeline[4].events} />
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
							<Site color="#F7665A" url={this.state.offset_timeline[0].url_hostname} hour={this.state.offset_timeline[0].hour} minute={this.state.offset_timeline[0].minute} events={this.state.offset_timeline[0].events} />
							<Site color="#8D608C" url={this.state.offset_timeline[1].url_hostname} hour={this.state.offset_timeline[1].hour} minute={this.state.offset_timeline[1].minute} events={this.state.offset_timeline[1].events} />
							<Site color="#FFB95A" url={this.state.offset_timeline[2].url_hostname} hour={this.state.offset_timeline[2].hour} minute={this.state.offset_timeline[2].minute} events={this.state.offset_timeline[2].events} />
							<Site color="#4D8FAC" url={this.state.offset_timeline[3].url_hostname} hour={this.state.offset_timeline[3].hour} minute={this.state.offset_timeline[3].minute} events={this.state.offset_timeline[3].events} />
							<Site color="#8DB255" url={this.state.offset_timeline[4].url_hostname} hour={this.state.offset_timeline[4].hour} minute={this.state.offset_timeline[4].minute} events={this.state.offset_timeline[4].events} />
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
			this.updateTheme();
			this.dateKeeper();
			setInterval(this.dateKeeper, 1000);
			setInterval(this.updateTheme, 1000);
		}, (999 - date.getMilliseconds()));
		this.calculateTimeline();
		date = new Date();
		setTimeout(() => {
			
			setInterval(this.calculateTimeline, 60000);
			this.calculateTimeline();
		}, (59 - date.getSeconds())*1000 + (999 - date.getMilliseconds()));
		browser.storage.onChanged.addListener((changes, areaName) => {
			if (areaName === "local") {
				if (changes.latitude) {
					this.setState({latitude: changes.latitude.newValue});
				}
				if (changes.longitude) {
					this.setState({longitude: changes.longitude.newValue});
				}
			}
		});
	}
}

export default Hourglass;