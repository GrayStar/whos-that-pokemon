import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import registerServiceWorker from './registerServiceWorker';

import { Home } from './screens/home';
import { Movies } from './screens/movies';
import { MovieDetail } from './screens/movie-detail';

render (
	<Router>
		<div>
			<nav>
				<ul>
					<li><Link to="/">Home</Link></li>
					<li><Link to="/movies">Movies</Link></li>
				</ul>
			</nav>

			<hr/>

			<Route exact path='/' component={ Home }/>
			<Route exact path='/movies' component={ Movies }/>
			<Route path='/movies/:id' component={ MovieDetail }/>
		</div>
	</Router>,
	document.getElementById('root')
);

registerServiceWorker();