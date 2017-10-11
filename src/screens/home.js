import React, { Component } from 'react';
import { API } from '../api';
import doubleMetaphone from 'talisman/phonetics/double-metaphone';

import { Button } from '../components/button/button';

import './home.css';

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
			countdown: 5,
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
		this._registerSpeechRecognition();
	}

	_registerSpeechRecognition () {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		this.recognition = new SpeechRecognition();
		this.recognition.lang = 'en-US';
		this.recognition.continuous = true;
		this.recognition.interimResults = false;

		this.recognition.addEventListener('start', this._handleRecognitionStart.bind(this));
		this.recognition.addEventListener('end', this._handleRecognitionEnd.bind(this));
		this.recognition.addEventListener('result', this._handleRecognitionResult.bind(this));
	}

	_handleRecognitionStart () {
		this.setState({ listening: true });
	}

	_handleRecognitionEnd () {
		this.setState({ listening: false });
		if (this._checkAnswer()) {
			this.setState({ correctAnswers: this.state.correctAnswers + 1 });
			this._say(`It's ${ this.state.pokemon.name }! You said ${ this.state.youSaid }. Correct.`, () => {
				if (this.alreadyChosenPokemonIds.length >= this.endingPokemon) return this.setState({gameState: this.GAME_STATES.WIN});
				this._startNewRound()
			});
		} else {
			this.setState({gameState: this.GAME_STATES.LOSE});
			this._say(`You said: ${ this.state.youSaid }. Wrong. The correct answer was ${ this.state.pokemon.name }. Game Over. You guessed ${ this.state.correctAnswers } pokémon correctly.`);
		}
	}

	_handleRecognitionResult (e) {
		this.recognition.stop();

		let last = e.results.length - 1;
		let text = e.results[last][0].transcript;
		this.setState({ youSaid: text });
	}

	_checkAnswer () {
		let phoneticAnswer = doubleMetaphone(this.state.pokemon.name);
		let phoneticGuess = this.state.youSaid.split(' ').map(word => {
			return doubleMetaphone(word);
		});

		for (let metaphonePair of phoneticGuess) {
			if ((metaphonePair[0] === phoneticAnswer[0] || metaphonePair[0] === phoneticAnswer[1]) ||
				(metaphonePair[1] === phoneticAnswer[0] || metaphonePair[1] === phoneticAnswer[1])) {
				this.setState({youSaid: this.state.pokemon.name});
				return true;
			}
		}
		return false;
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

	_say (message, callback) {
		this.utterance = null;
		this.utterance = new SpeechSynthesisUtterance(message);

		if (callback) this.utterance.addEventListener('end', () =>  { callback(); });
		window.speechSynthesis.speak(this.utterance);
	}

	_startNewRound () {
		this.setState({ youSaid: '' });
		let pokemonId = this._choseNewPokemon();

		this._getPokemonInfo(pokemonId, (res) => {
			console.log(res);
			this.setState({
				pokemon: res,
				loading: false
			}, () => {
				this._say("Who's that pokémon?", () => { this._startGuessTimer() });
			});
		});
	}

	_choseNewPokemon () {
		let randomPokemonId = this._getRandomIntInclusive(this.startingPokemon, this.endingPokemon);

		if (this.alreadyChosenPokemonIds.includes(randomPokemonId)) {
			return this._choseNewPokemon();
		} else {
			this.alreadyChosenPokemonIds.push(randomPokemonId);
			return randomPokemonId;
		}
	}

	_getRandomIntInclusive (min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	_getPokemonInfo (id, callback) {
		this.setState({ loading: true });

		API.getPokemon(id).then(response => {
			if (callback) callback(response);
		}).catch(e => {
			this.setState({ loading: false });
			alert("Sorry, we couldn't find any pokémon in the tall grass! \n" + e);
		});
	}

	_startGuessTimer () {
		this.setState({ countdown: 5 });
		this.recognition.start();

		const countdownInterval = setInterval(() => {
			this.setState({ countdown: this.state.countdown - 1 });
		}, 1000);

		setTimeout(() => {
			clearInterval(countdownInterval);
			this.recognition.stop()
		}, 5000);
	}

	_handleStartButtonClick () {
		this._resetGame();
		this._startNewRound();
		this.setState({ playing: true, gameState: this.GAME_STATES.PLAY});
	}

	get _listeningIndicator () {
		if (this.state.listening) {
			return <p>Listening... { this.state.countdown }</p>;
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
			<article className="home">
				<img className="logo" src="/assets/International_Pokémon_logo.svg" alt="Pokemon"/>
				<h1>NAME GAME</h1>
				<ul>
					<li>Speak the Pokemon's name when it appears</li>
					<li>Guess all 151 without fail to achieve perfect victory</li>
					<li>We will only accept perfection</li>
				</ul>
				<Button onClick={ this._handleStartButtonClick.bind(this) } title='Start'/>
			</article>
		);
	}

	get _gameView () {
		if (this.state.loading) {
			return (
				<article className="home">
					<p>Searching tall grass for pokémon...</p>
					<p>Current Streak: { this.state.correctAnswers }</p>
				</article>
			);
		} else {
			return (
				<article className="home">
					{ this._pokemonSprite }
					{ this._listeningIndicator }
					<p>You Said: { this.state.youSaid }</p>
					<p>Current Streak: { this.state.correctAnswers }</p>
				</article>
			);
		}
	}

	get _gameWinView () {
		return (
			<article className="home">
				<h2>Congratulation. You guessed all of the pokemon.</h2>
				<Button onClick={ this._handleStartButtonClick.bind(this) } title='Play Again'/>
			</article>
		);
	}

	get _gameLossView () {
		return (
			<article className="home">
				<h2>Game Over. You Lose. Loser.</h2>
				<p>Current Streak: { this.state.correctAnswers }</p>
				<Button onClick={ this._handleStartButtonClick.bind(this) } title='Play Again'/>
			</article>
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
			<div className="home-wrapper">{ this._gameState }</div>
		);
	};
}