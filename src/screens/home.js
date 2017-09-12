import React, { Component } from 'react';
import { API } from '../api';

export class Home extends Component {
	constructor () {
		super();

		this.GAME_STATES = {
			LAUNCH: 'LAUNCH',
			PLAY: 'PLAY',
			WIN: 'WIN',
			LOSE: 'LOSE'
		};

		this.state = {
			gameState: this.GAME_STATES.LAUNCH,
			loading: false,
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
			this._say(`You answered: ${ this.state.youSaid }. Correct.`, () => { this._chosePokemon() });
		} else {
			this.setState({gameState: this.GAME_STATES.LOSE});
			this._say(`You answered: ${ this.state.youSaid }. Wrong. The correct answer was ${ this.state.pokemon.name }. Game Over. You guessed ${ this.state.correctAnswers } pokémon correctly.`, () => {
				this._resetGame();
			});
		}
	}

	_resetGame () {
		this.setState({
			youSaid: '',
			playing: false,
			listening: false,
			correctAnswers: 0,
			pokemon: null,
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
		this.setState({ playing: true, gameState: this.GAME_STATES.PLAY});
	}

	_say (message, callback) {
		this.utterance = null;
		this.utterance = new SpeechSynthesisUtterance(message);

		if (callback) this.utterance.addEventListener('end', () =>  { callback(); });

		window.speechSynthesis.speak(this.utterance);
	}

	_chosePokemon () {
		var randomPokemonId = this._getRandomIntInclusive(this.startingPokemon, this.endingPokemon);

		if (this.alreadyChosenPokemonIds.length >= this.endingPokemon) {
			this.setState({gameState: this.GAME_STATES.WIN});
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
		this.setState({ loading: true });

		API.getPokemon(id).then(res => {
			console.log(res);
			this.setState({
				pokemon: res,
				loading: false
			}, this._startRound);
		}).catch(e => {
			this.setState({ loading: false });
			alert("Error: \n" + e);
		});
	}

	_startRound () {
		this._say('Who is that pokémon?', () => { this._startGuessTimer() });
	}

	_startGuessTimer () {
		this.recognition.start();
		setTimeout(() => {this.recognition.stop()}, 5000);
	}

	get _loadingIndicator () {
		if (this.state.loading) {
			return <p>Searching tall grass pokémon...</p>;
		} else {
			return null;
		}
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

	get _gameStartView () {
		return (
			<div className="message-container">
				<h2>Who is that pokemon.</h2>
				<p>Click the Button to play.</p>
				<p>Guess all 151 without fail to achieve perfect victory. We will settle for nothing less.</p>
				<button onClick={ this._handleStartButtonClick.bind(this) }>Start</button>
			</div>
		);
	}

	get _gameView () {
		return (
			<article className="home">
				{ this._pokemonSprite }
				{ this._loadingIndicator }
				{ this._listeningIndicator }
				<p>{ this.state.youSaid }</p>
				<p>{ this.state.correctAnswers }</p>
			</article>
		)
	}

	get _gameWinView () {
		return (
			<div className="message-container">
				<h2>Congratulation. You guessed all of the pokemon.</h2>
				<button onClick={ this._handleStartButtonClick.bind(this) }>Play Again</button>
			</div>
		);
	}

	get _gameLossView () {
		return (
			<div className="message-container">
				<h2>Game Over. You Lose. Loser.</h2>
				<button onClick={ this._handleStartButtonClick.bind(this) }>Play Again</button>
			</div>
		);
	}

	get _gameState () {
		switch (this.state.gameState) {
			case this.GAME_STATES.LAUNCH:
				return this._gameStartView;
			case this.GAME_STATES.PLAY:
				return this._gameView;
			case this.GAME_STATES.WIN:
				return this._gameWinView;
			case this.GAME_STATES.LOSE:
				return this._gameLossView;
			default:
				return this._gameStartView;
		}
	}

	render () {
		return(
			<div>{ this._gameState }</div>
		);
	};
}