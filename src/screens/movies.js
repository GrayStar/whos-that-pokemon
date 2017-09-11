import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class Movies extends Component {
	constructor ({ match }) {
        super();

        this.state = {};
        this.match = match;
    }

	render () {
		return(
			<article className="movies">
				<h1>Movies</h1>

				<ul>
					<li><Link to={ `${this.match.url}/movie-one` }>Movie One</Link></li>
					<li><Link to={ `${this.match.url}/movie-two` }>Movie Two</Link></li>
					<li><Link to={ `${this.match.url}/movie-three` }>Movie Three</Link></li>
				</ul>
			</article>
		);
	}
}