import React, { Component } from 'react';
import { API } from '../api';

export class Home extends Component {
	constructor () {
		super();

		this.state = {
			listening: false,
			correctAnswers: 0
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
			res.json().then(json => {
				console.log(json);
				this.setState({ pokemon: json }, () => {
					this._startRound();
				});
			});
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
				<button onClick={ this._handleButtonClick.bind(this) }>Choose Another</button>
				<p>{ this.state.correctAnswers }</p>
			</article>
		);
	}
}