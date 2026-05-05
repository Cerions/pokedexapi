const URL = 'https://pokeapi.co/api/v2/';

document.getElementById('searchBtn').addEventListener('click', () => {
    const nome = document.getElementById('searchInput').value.toLowerCase().trim();
    if (nome) cercaPokemon(nome);
})

async function cercaPokemon(nome) {
    try {
        const res  = await fetch(URL + 'pokemon/' + nome);
        const dati = await res.json();

        document.getElementById('pokeName').textContent = dati.name.toUpperCase();
        document.getElementById('sprite').src = dati.sprites.front_default;

        const tipi = dati.types.map(t => t.type.name).join(', ');
        document.getElementById('pokeType').textContent = 'Tipo: ' + tipi;

        document.getElementById('card').classList.remove('hidden');
    }
    catch (err) {
        alert('Pokemon non trovato!');
    }
}