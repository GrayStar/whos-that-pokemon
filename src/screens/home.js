import React, { Component } from 'react';

export class Home extends Component {
	constructor () {
		super();

		this.recognition = null;

		this.state = {
			listening: false,
			conversationTopic: null
		};
	}

	componentWillMount() {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		this.recognition = new SpeechRecognition();
		this.recognition.lang = 'en-US';
		this.recognition.interimResults = false;


		this.recognition.addEventListener('result', (e) => {
			let last = e.results.length - 1;
			let text = e.results[last][0].transcript;

			this.setState({
				conversationTopic: text
			});
		});

		this.recognition.onaudiostart = () => {
			this.setState({ listening: true });
		}
		this.recognition.onend = () => {
			this.setState({ listening: false });
		}
	}

	_handleButtonClick () {
		this.recognition.start();
	}

	get _listeningIndicator () {
		if (this.state.listening) {
			return (
				<p>Listening...</p>
			);
		} else {
			return null;
		}
	}

	get _conversationTopic () {
		if (this.state.conversationTopic) {
			return (
				<h2>{ this.state.conversationTopic }</h2>
			);
		} else {
			return <h2>Please set a topic.</h2>;
		}
	}

	get _captureVoiceButton () {
		if (this.state.conversationTopic) {
			return null;
		} else {
			return <button onClick={ this._handleButtonClick.bind(this) }>Say Your Topic</button>;
		}
	}

	render () {
		return(
			<article className="home">
				{ this._conversationTopic }
				{ this._listeningIndicator }
				{ this._captureVoiceButton }
			</article>
		);
	}
}