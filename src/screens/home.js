import React, { Component } from 'react';
import { API } from '../api';

export class Home extends Component {
	constructor () {
		super();

		this.state = {
			listening: false,
			correctAnswers: 0,
			youSaid: ''
		};

		this.startingPokemon = 1;
		this.endingPokemon = 151;
		this.alreadyChosenPokemonIds = [];

		this.recognition = null;
		this.utterance = null;
	}

	componentWillMount() {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		this.recognition = new SpeechRecognition();
		this.recognition.lang = 'en-US';
		this.recognition.continuous = true;
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

		if (this.state.youSaid.toLocaleLowerCase() === this.state.pokemon.name.toLocaleLowerCase()) {
			let utterance = new SpeechSynthesisUtterance(`You answered: ${ this.state.youSaid }. Correct.`);
			window.speechSynthesis.speak(utterance);
		} else {
			let utterance = new SpeechSynthesisUtterance(`You answered: ${ this.state.youSaid }. Wrong. The correct answer was ${ this.state.pokemon.name }`);
			window.speechSynthesis.speak(utterance);
		}
	}

	_handleRecognitionResult (e) {
		this.recognition.stop();

		let last = e.results.length - 1;
		let text = e.results[last][0].transcript;
		this.setState({ youSaid: text });
	}

	_handleButtonClick () {
		this._chosePokemon();
	}

	_chosePokemon () {
		var randomPokemonId = this._getRandomIntInclusive(this.startingPokemon, this.endingPokemon);

		if (this.alreadyChosenPokemonIds.length >= this.endingPokemon) {
			return console.log('you got them all!');
		}

		if (this.alreadyChosenPokemonIds.includes(randomPokemonId)) {
			return this._chosePokemon();
		} else {
			this.alreadyChosenPokemonIds.push(randomPokemonId);
			this._getPokemonInfo(randomPokemonId);
			this.setState({ correctAnswers: this.state.correctAnswers + 1 });
			return console.log(this.alreadyChosenPokemonIds);
		}
	}

	_getPokemonInfo (id) {
		API.getPokemon(id).then(res => {
			console.log(res);
			this.setState({ pokemon: res }, this._startRound);
		}).catch(e => {
			alert("Couldn't get data for the pocket manzzzz \n" + e);
		});
	}

	_startRound () {
		let utterance = new SpeechSynthesisUtterance('Who is that pokémon?');
		utterance.addEventListener('end', this._startGuessTimer.bind(this));
		window.speechSynthesis.speak(utterance);
	}

	_startGuessTimer () {
		this.recognition.start();
		setTimeout(() => {this.recognition.stop()}, 5000);
	}

	get _listeningIndicator () {
		if (this.state.listening) {
			return <p>Listening...</p>;
		} else {
			return null;
		}
	}

	get _pokemonSprite () {
		if (this.state.pokemon) {
			return <img src={ this.state.pokemon.sprites.front_default } alt="pokemon"/>;
		} else {
			return null;
		}
	}

	render () {
		return(
			<article className="home">
				{ this._pokemonSprite }
				{ this._listeningIndicator }
				<p>{ this.state.youSaid }</p>
				<button onClick={ this._handleButtonClick.bind(this) }>Start</button>
				<p>{ this.state.correctAnswers }</p>
			</article>
		);
	}
}