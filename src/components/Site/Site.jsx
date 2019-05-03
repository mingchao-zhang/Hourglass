import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Site.scss';

class Site extends Component {
	render() {
		return (
			<div className="site">
				<header className="site_header">
					<p className="url">{this.props.url}</p>
					<p className="time">
						{this.props.hour}
						<span className="colon">:</span>
						{this.props.minute.padStart(2, "0")}
					</p>
				</header>

				<main className="timeline">
					<div className="timeline_wrapper">
						{
							this.props.events.map((event, i) => (
								<div key={i} className="event" style={{ width: event.width, left: event.left, backgroundColor: this.props.color }}></div>
							))
						}
					</div>
				</main>
			</div>
		);
	}
}

Site.propTypes = {
	// URL.
	url: PropTypes.string,
	// Time.
	hour: PropTypes.string,
	minute: PropTypes.string,
	// Timeline.
	color: PropTypes.string,
	events: PropTypes.arrayOf(PropTypes.shape({ width: PropTypes.string.isRequired, left: PropTypes.string.isRequired }).isRequired)
};

// For testing. Remove!
/*
Site.defaultProps = {
	// URL.
	url: "site.jp",
	// Time.
	hour: "8",
	minute: "07",
	// Timeline.
	color: "#EE051155",
	events: [{ width: "10%", left: "20%" },{ width: "5%", left: "40%" },{ width: "0%", left: "50%" }]
}
*/
/*
Site.defaultProps = {
	// URL.
	url: "——",
	// Time.
	hour: "——",
	minute: "——",
	// Timeline.
	color: "hsla(0, 0, 0, 0)",
	events: []
}
*/

export default Site;