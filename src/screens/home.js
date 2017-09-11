import React, { Component } from 'react';

export class Home extends Component {
	constructor () {
		super();

		this.state = {
			listening: false
		};

		this.startingPokemon = 1;
		this.endingPokemon = 151;
		this.alreadyChosenPokemonIds = [];

		this.recognition = null;
	}

	componentWillMount() {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		this.recognition = new SpeechRecognition();
		this.recognition.lang = 'en-US';
		this.recognition.interimResults = false;

		this.recognition.addEventListener('start', this._handleRecognitionAudioStart.bind(this));
		this.recognition.addEventListener('end', this._handleRecognitionEnd.bind(this));
		this.recognition.addEventListener('result', this._handleRecognitionResult.bind(this));


	}

	_getRandomIntInclusive (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	_handleRecognitionAudioStart () {
		this.setState({ listening: true });
	}

	_handleRecognitionEnd () {
		this.setState({ listening: false });
	}

	_handleRecognitionResult (e) {
		let last = e.results.length - 1;
		let text = e.results[last][0].transcript;

		this.setState({
			conversationTopic: text
		});

		let utterance = new SpeechSynthesisUtterance(text);
		window.speechSynthesis.speak(utterance);
	}

	_handleButtonClick () {
		//this.recognition.start();
		this._chosePokemon();
	}

	_chosePokemon () {
		var randomPokemonId = this._getRandomIntInclusive(this.startingPokemon, this.endingPokemon);

		if (this.alreadyChosenPokemonIds.includes(randomPokemonId)) {
			this._chosePokemon();
		} else {
			this.alreadyChosenPokemonIds.push(randomPokemonId);
			console.log(this.alreadyChosenPokemonIds);
		}
	}

	get _listeningIndicator () {
		if (this.state.listening) {
			return <p>Listening...</p>;
		} else {
			return null;
		}
	}

	render () {
		return(
			<article className="home">
				{ this._listeningIndicator }
				<button onClick={ this._handleButtonClick.bind(this) }>Choose Another</button>
			</article>
		);
	}
}