import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './LinearClock.scss';

class LinearClock extends Component {
	hourToLocaleString(hour) {
		let date = new Date(this.props.date);
		date.setHours(hour);
		return date.toLocaleString(navigator.language, { "hour": "numeric" }).replace(/\D/g, "");
	}

	render() {
		return (
			<div className="linear_clock">
				<div className="clock_face" id="dot" style={{"clipPath": "circle(1rem at " + ((this.props.date.getHours()*60*60 + this.props.date.getMinutes()*60 + this.props.date.getSeconds())/(24*60*60)*100).toString() + "% 50%)"}}>
					<div className="color"></div>

					<div className="numbers">
						<p>{this.hourToLocaleString(0)}</p>
						<p>{this.hourToLocaleString(6)}</p>
						<p>{this.hourToLocaleString(12)}</p>
						<p>{this.hourToLocaleString(18)}</p>
						<p>{this.hourToLocaleString(24)}</p>
					</div>

					<div className="lines">
						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>
					</div>
				</div>

				<div className="clock_face">
					<div className="numbers">
						<p>{this.hourToLocaleString(0)}</p>
						<p>{this.hourToLocaleString(6)}</p>
						<p>{this.hourToLocaleString(12)}</p>
						<p>{this.hourToLocaleString(18)}</p>
						<p>{this.hourToLocaleString(24)}</p>
					</div>

					<div className="lines">
						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major"></p>

						<p className="minor"></p>
						<p className="minor"></p>

						<p className="major" style={{"visibility": "hidden"}}></p>
					</div>
				</div>
			</div>
		);
	}
}

LinearClock.propTypes = {
	// Date.
	date: PropTypes.instanceOf(Date).isRequired
};

export default LinearClock;