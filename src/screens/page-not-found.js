import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class PageNotFound extends Component {
    constructor ({ location }) {
        super();

        this.state = {};
        this.location = location;
    }

    render () {
        return(
            <article className="page-not-found">
                <h1>Page not Found for { this.location.pathname }</h1>
            </article>
        );
    }
}