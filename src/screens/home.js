import React, { Component } from 'react';
import { API } from '../api';

export class Home extends Component {
	constructor () {
		super();

		this.state = {
			playing: false,
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
			this.setState({ correctAnswers: this.state.correctAnswers + 1 });

			let correctAnswerUtterance = new SpeechSynthesisUtterance(`You answered: ${ this.state.youSaid }. Correct.`);
			correctAnswerUtterance.addEventListener('end', () =>  {
				this._chosePokemon();
			});
			window.speechSynthesis.speak(correctAnswerUtterance);
		} else {
			this._endGame();
		}
	}

	_endGame () {
		let endGameUtterance = new SpeechSynthesisUtterance(`You answered: ${ this.state.youSaid }. Wrong. The correct answer was ${ this.state.pokemon.name }. Game Over. You guessed ${ this.state.correctAnswers } pokémon correctly.`);
		endGameUtterance.addEventListener('end', () => {
			console.log('endGameUtterance');
			this._resetGame();
		});
		window.speechSynthesis.speak(endGameUtterance);
	}

	_resetGame () {
		this.setState({
			youSaid: '',
			playing: false,
			listening: false,
			correctAnswers: 0,
			pokemon: null
		});
		this.alreadyChosenPokemonIds = [];
	}

	_handleRecognitionResult (e) {
		this.recognition.stop();

		let last = e.results.length - 1;
		let text = e.results[last][0].transcript;
		this.setState({ youSaid: text });
	}

	_handleStartButtonClick () {
		this._chosePokemon();
		this.setState({ playing: true });
	}

	_chosePokemon () {
		console.log('choose pokemon');

		var randomPokemonId = this._getRandomIntInclusive(this.startingPokemon, this.endingPokemon);

		if (this.alreadyChosenPokemonIds.length >= this.endingPokemon) {
			return console.log('you got them all!');
		}

		if (this.alreadyChosenPokemonIds.includes(randomPokemonId)) {
			return this._chosePokemon();
		} else {
			this.alreadyChosenPokemonIds.push(randomPokemonId);
			this._getPokemonInfo(randomPokemonId);
			return console.log(this.alreadyChosenPokemonIds);
		}
	}

	_getPokemonInfo (id) {
		API.getPokemon(id).then(res => {
			console.log(res);
			this.setState({ pokemon: res }, this._startRound);
		}).catch(e => {
			alert("Error: \n" + e);
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

	get _startButton () {
		if (this.state.playing) {
			return null;
		} else {
			return <button onClick={ this._handleStartButtonClick.bind(this) }>Start</button>;
		}
	}

	render () {
		return(
			<article className="home">
				{ this._pokemonSprite }
				{ this._listeningIndicator }
				<p>{ this.state.youSaid }</p>
				{ this._startButton }
				<p>{ this.state.correctAnswers }</p>
			</article>
		);
	}
}