import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import registerServiceWorker from './registerServiceWorker';

import { Home } from './screens/home';

render (
	<Router>
		<Route exact path='/' component={ Home }/>
	</Router>,
	document.getElementById('root')
);

registerServiceWorker();