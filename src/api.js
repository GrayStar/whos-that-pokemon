export const API = {
	getPokemon: (id) => {
		return fetch(`http://pokeapi.co/api/v2/pokemon/${id}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then(res => {
			return res.json();
		}).then(json => {
			return json;
		}).catch(e => {
			alert('something went wrong \n' + e);
		});
	}
};