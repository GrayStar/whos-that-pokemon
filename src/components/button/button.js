import React, { Component } from 'react';
import './button.css';

export class Button extends Component {
    _handleButtonClick () {
        this.props.onClick();
    }

    render () {
        return(
            <button onClick={ this._handleButtonClick.bind(this) }>{ this.props.title }</button>
        );
    };
}