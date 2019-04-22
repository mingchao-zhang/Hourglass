import React, { Component } from 'react';
import 'normalize.css';
import './Hourglass.scss';
import './Themes/Day.scss';
import './Themes/Twilight.scss';
import './Themes/Night.scss';
import 'typeface-frank-ruhl-libre';
import 'typeface-spectral';
import Site from './Components/Site';

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
					<h1 className="month">{(this.state.date.getMonth() + 1).toString()}</h1>
					<h2 className="time">
						<div className="hour">{this.state.date.toLocaleString(navigator.language, { hour: "numeric" }).replace(/(\D)+/, "")}</div>
						<div className="colon">:</div>
						<div className="minute">{this.state.date.toLocaleString(navigator.language, { minute: "2-digit" }).padStart(2, "0")}</div>
					</h2>
				</header>

				<main>
					<section>
						<header className="section_header">
							<div className="date_day">
								<h2 className="date">{this.state.date.getDate().toString()}</h2>
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
								<h2 className="date">{this.offsetDate().getDate().toString()}</h2>
								<h3 className="day">{this.offsetDate().toLocaleString(navigator.language, { weekday: "short" })}</h3>
							</div>

							<select id="offset" value={this.state.offset} onChange={this.offsetChange}>
								<option value={1}>1 day ago</option>
								<option value={2}>2 days ago</option>
								<option value={3}>3 days ago</option>
								<option value={4}>4 days ago</option>
								<option value={5}>5 days ago</option>
								<option value={6}>6 days ago</option>
								<option value={7}>7 days ago</option>
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
				</main>

				<footer className="main_footer"></footer>
			</div>
		);
	}

	componentDidMount() {
		setInterval(this.dateKeeper, 1000);
	}
}

export default Hourglass;