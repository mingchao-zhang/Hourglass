import React from 'react';
import ReactDOM from 'react-dom';
import Hourglass from './Hourglass';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<Hourglass />, div);
	ReactDOM.unmountComponentAtNode(div);
});