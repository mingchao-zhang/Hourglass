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

class Hourglass extends Component {
	constructor(props) {
		super(props);
		this.state = {
			date: new Date(),
			offset: 1
		};

		this.dateKeeper = this.dateKeeper.bind(this);
		this.offsetChange = this.offsetChange.bind(this);
		this.offsetDate = this.offsetDate.bind(this);
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
							<Site color="#F7665A" />
							<Site color="#8D608C" />
							<Site color="#FFB95A" />
							<Site color="#4D8FAC" />
							<Site color="#8DB255" />
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
							<Site color="#F7665A" />
							<Site color="#8D608C" />
							<Site color="#FFB95A" />
							<Site color="#4D8FAC" />
							<Site color="#8DB255" />
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
	}
}

export default Hourglass;