export const API = {
	getPokemon: (id) => {
		return fetch(`http://pokeapi.co/api/v2/pokemon/${id}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
	}
};