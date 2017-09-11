import React, { Component } from 'react';

export class MovieDetail extends Component {
    constructor ({ match }) {
        super();

        this.state = {};
        this.match = match;
    }

    render () {
        return(
            <article className="movie-detail">
                <h1>Movie Detail</h1>
                <p>{ this.match.params.id }</p>
            </article>
        );
    }
}