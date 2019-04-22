import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Site.scss';

class Site extends Component {
	render() {
		return (
			<div className="site">
				<header className="site_header">
					<p className="url">{this.props.url}</p>
					<div className="time">
						<p className="hour">{this.props.hour}</p>
						<p className="colon">:</p>
						<p className="minute">{this.props.minute.padStart(2, "0")}</p>
					</div>
				</header>

				<main className="timeline">
					<div className="timeline_wrapper">
						{
							this.props.events.map(event => (
								<div key={event.left} className="event" style={{ width: event.width, left: event.left, backgroundColor: this.props.color }}></div>
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
	url: PropTypes.string.isRequired,
	// Time.
	hour: PropTypes.string.isRequired,
	minute: PropTypes.string.isRequired,
	// Timeline.
	color: PropTypes.string.isRequired,
	events: PropTypes.arrayOf(PropTypes.shape({ width: PropTypes.string.isRequired, left: PropTypes.string.isRequired }).isRequired).isRequired
};

// For testing. Remove!
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

export default Site;