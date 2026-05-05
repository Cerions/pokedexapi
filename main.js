const URL = 'https://pokeapi.co/api/v2/';

const coloriTipo = {
    fire: '#FF6B35',
    water: '#4FC3F7',
    grass: '#81C784',
    electric: '#FFD54F',
    psychic: '#F48FB1',
    ice: '#80DEEA',
    dragon: '#7E57C2',
    dark: '#546E7A',
    fairy: '#F8BBD9',
    normal: '#BCAAA4',
    fighting: '#EF5350',
    flying: '#90CAF9',
    poison: '#AB47BC',
    ground: '#FFCA28',
    rock: '#8D6E63',
    bug: '#AED581',
    ghost: '#7E57C2',
    steel: '#B0BEC5',
};

document.getElementById('searchBtn').addEventListener('click', () => {
    const nome = document.getElementById('searchInput').value.toLowerCase().trim();
    if (nome) cercaPokemon(nome);
});

document.getElementById('generateRandomBtn').addEventListener('click', () => {
    let randomInt = randomIntFromInterval(1, 1025);
    generatePokemon(randomInt);
});

async function cercaPokemon(nome) {
    try {
        const res  = await fetch(URL + 'pokemon/' + nome);
        const dati = await res.json();
        mostraCard(dati);
    } catch (err) {
        alert('Pokemon non trovato!');
    }
}

async function generatePokemon(randomInt) {
    try {
        const res  = await fetch(URL + 'pokemon/' + randomInt);
        const dati = await res.json();
        mostraCard(dati);
    } catch (err) {
        alert('Pokemon non trovato!');
    }
}

async function cercaPerTipo(tipo) {
    try {
        document.getElementById('statsSection').classList.add('hidden');
        const res  = await fetch(URL + 'type/' + tipo);
        const dati = await res.json();

        const lista = dati.pokemon.slice(0, 10);

        // svuota la card attuale e mostra un messaggio
        document.getElementById('card').classList.add('hidden');
        document.getElementById('risultatiTipo').innerHTML = `<p>Pokémon di tipo <strong>${tipo}</strong>:</p>`;

        for (const p of lista) {
            const res2  = await fetch(p.pokemon.url);
            const pokemon = await res2.json();

            const miniCard = document.createElement('div');
            miniCard.className = 'mini-card';
            miniCard.style.backgroundColor = coloriTipo[tipo] || '#ccc';
            miniCard.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <p>${pokemon.name.toUpperCase()}</p>
            `;
            document.getElementById('risultatiTipo').appendChild(miniCard);
        }
    } catch (err) {
        alert('Errore nel caricamento del tipo!');
    }
}

function mostraCard(dati) {
    document.getElementById('statsSection').classList.remove('hidden');
    document.getElementById('risultatiTipo').innerHTML = '';

    document.getElementById('pokeName').textContent = dati.name.toUpperCase();
    document.getElementById('sprite').src = dati.sprites.front_default;

    const tipiHTML = dati.types
        .map(t => `<button class="tipo-btn" onclick="cercaPerTipo('${t.type.name}')">${t.type.name}</button>`)
        .join(' ');
    document.getElementById('pokeType').innerHTML = tipiHTML;

    const tipoPrincipale = dati.types[0].type.name;
    document.getElementById('card').style.backgroundColor = coloriTipo[tipoPrincipale] || '#ccc';

    aggiornaStat(dati);
    document.getElementById('card').classList.remove('hidden');
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function aggiornaStat(dati) {
    const stats = dati.stats;
    const righe = document.querySelectorAll('.stat-row');

    stats.forEach((s, i) => {
        const valore = s.base_stat;
        const barra = righe[i].querySelector('.stat-bar-fill');
        const numero = righe[i].querySelector('.stat-num');

        barra.style.width = (valore / 255 * 100) + '%';
        numero.textContent = valore;
    });
}