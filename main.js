const URL = 'https://pokeapi.co/api/v2/';

const coloriTipo = {
    fire: '#FF6B35',
    water: '#4FC3F7',
    grass: '#81C784',
    electric: '#FFD54F',
    psychic: '#86519b',
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

// === PREFERITI ===
const FAV_KEY = 'pokemonPreferiti';

let tutti = [];

// Per esercizi forEach, map, filter
const pokemon = [
    { nome: 'Pikachu', tipo: 'elettro', hp: 35 },
    { nome: 'Charmender', tipo: 'fuoco', hp: 39 },
    { nome: 'Squirtle', tipo: 'acqua', hp: 44 },
    { nome: 'Bulbasaur', tipo: 'erba', hp: 45 },
    { nome: 'Geodude', tipo: 'roccia', hp: 40 },
];

document.getElementById('searchBtn').addEventListener('click', () => {
    const nome = document.getElementById('searchInput').value.toLowerCase().trim();
    if (nome) cercaPokemon(nome);
});

document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const nome = document.getElementById('searchInput').value.toLowerCase().trim();
        if (nome) cercaPokemon(nome);
    }
});

document.getElementById('generateRandomBtn').addEventListener('click', () => {
    let randomInt = randomIntFromInterval(1, 1025);
    generatePokemon(randomInt);
});

document.getElementById('searchTypeBtn').addEventListener('click', () => {
    const type = document.getElementById('searchInputByType').value.toLowerCase().trim();
    if (type) cercaPerTipo(type);
})

document.getElementById('searchInputByType').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const type = document.getElementById('searchInputByType').value.toLowerCase().trim();
        if (type) cercaPerTipo(type);
    }
});

document.getElementById('loadFirstPokemon').addEventListener('click', () => {
    loadFirstPokemon();
});

// TODO settare limite da HTML
async function caricaDati(limit = 20) {
    const risposta = await fetch("https://pokeapi.co/api/v2/pokemon?limit=" + limit);
    const dati = await risposta.json();

    const promesse = dati.results.map(p => fetch(p.url));

    const risposte = await Promise.all(promesse);

    // conversione risposte in json
    const dettagli = await Promise.all(risposte.map(r => r.json()));

    tutti = dettagli;
    mostraGriglia(tutti); 
}

function mostraGriglia(lista) {
    const griglia = document.getElementById("griglia");
    griglia.innerHTML = "";

    lista.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <img src="${p.sprites.front_default}" alt="${p.name}">
      <p>${p.name}</p>
    `;
        griglia.appendChild(card);

        card.addEventListener('click', () => cercaPokemon(p.name));
    });
}

function cercaLive(testo) {
  const query = testo.toLowerCase();
  const filtrati = tutti.filter(p => p.name.includes(query));

  mostraGriglia(filtrati);
}

// Colleghiamo la funzione all'evento "input" della barra di ricerca
document.getElementById("searchInput").addEventListener("input", function() {
  cercaLive(this.value);
});

async function cercaPokemon(nome) {
    resetUI();

    try {
        const res = await fetch(URL + 'pokemon/' + nome);
        const dati = await res.json();
        mostraCard(dati);
    } catch (err) {
        alert('Pokemon non trovato!');
    }
}

async function generatePokemon(randomInt) {
    resetUI();

    try {
        const res = await fetch(URL + 'pokemon/' + randomInt);
        const dati = await res.json();
        mostraCard(dati);
    } catch (err) {
        alert('Pokemon non trovato!');
    }
}

async function cercaPerTipo(tipo) {
    resetUI();

    try {
        document.getElementById('statsSection').classList.add('hidden');
        document.getElementById('card').classList.add('hidden');

        const res = await fetch(URL + 'type/' + tipo);
        const dati = await res.json();

        const listaPokemon = dati.pokemon.slice(0, 10);
        const nomi = listaPokemon.map(entry => entry.pokemon.name);

        // popola la lista dei nomi a sinistra
        const ul = document.getElementById('listaPokemon');
        ul.innerHTML = '';
        ul.classList.remove('hidden');
        nomi.forEach(nome => {
            const li = document.createElement('li');
            li.textContent = nome;
            ul.appendChild(li);
        });

        // prepara la grid di minicard
        document.getElementById('tipoTitolo').innerHTML = `Pokémon di tipo <strong>${tipo}</strong>:`;
        document.getElementById('risultatiTipo').innerHTML = '';

        for (const p of listaPokemon) {
            const res2 = await fetch(p.pokemon.url);
            const pokemon = await res2.json();

            const miniCard = document.createElement('div');
            miniCard.className = 'mini-card';
            miniCard.style.backgroundColor = coloriTipo[tipo] || '#ccc';
            miniCard.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <p>${pokemon.name.toUpperCase()}</p>
            `;
            miniCard.addEventListener('click', () => cercaPokemon(pokemon.name));
            document.getElementById('risultatiTipo').appendChild(miniCard);
        }
    } catch (err) {
        alert('Errore nel caricamento del tipo!');
    }
}

function mostraCard(dati) {
    resetUI();
    document.getElementById('statsSection').classList.remove('hidden');

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

    document.getElementById('favBtn').onclick = () => togglePreferito(dati);
    aggiornaStellaFav(dati.id);
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

// carica i preferiti da localStorage all'avvio
function caricaPreferiti() {
    const data = localStorage.getItem(FAV_KEY);
    return data ? JSON.parse(data) : [];
}

// salva i preferiti in localStorage
function salvaPreferiti(lista) {
    localStorage.setItem(FAV_KEY, JSON.stringify(lista));
}

// aggiunge o rimuove dai preferiti
function togglePreferito(pokemon) {
    let preferiti = caricaPreferiti();
    const index = preferiti.findIndex(p => p.id === pokemon.id);

    if (index === -1) {
        // aggiungi
        preferiti.push({
            id: pokemon.id,
            name: pokemon.name,
            sprite: pokemon.sprites.front_default,
            tipo: pokemon.types[0].type.name
        });
    } else {
        // rimuovi
        preferiti.splice(index, 1);
    }

    salvaPreferiti(preferiti);
    mostraPreferiti();
    aggiornaStellaFav(pokemon.id);
}

// disegna la lista dei preferiti
function mostraPreferiti() {
    const preferiti = caricaPreferiti();
    const container = document.getElementById('preferitiLista');

    if (preferiti.length === 0) {
        container.innerHTML = '<p>Lista preferiti vuota.</p>';
        return;
    }

    container.innerHTML = preferiti.map(p => `
        <div class="fav-card" style="background-color: ${coloriTipo[p.tipo] || '#ccc'}"
             onclick="cercaPokemon('${p.name}')">
            <img src="${p.sprite}" alt="${p.name}">
            <p>${p.name.toUpperCase()}</p>
        </div>
    `).join('');
}

// aggiorna la stellina in base allo stato
function aggiornaStellaFav(pokemonId) {
    const preferiti = caricaPreferiti();
    const isFav = preferiti.some(p => p.id === pokemonId);
    document.getElementById('favBtn').textContent = isFav ? '★' : '☆';
}

async function loadFirstPokemon() {
    resetUI();

    const lista = await fetch(URL + 'pokemon?limit=10');
    const datiLista = await lista.json();

    const dettagli = await Promise.all(
        datiLista.results.map(function (p) {
            return fetch(p.url).then(r => r.json());
        })
    );

    const pokemon = dettagli.map(d => ({
        nome: d.name,
        hp: d.stats[0].base_stat,
        sprite: d.sprites.front_default
    }));

    const forti = pokemon.filter(p => p.hp >= 44);
    const ordinati = ordinaPokemonPerHp(forti);

    const ul = document.getElementById('listaPokemon');
    ul.innerHTML = '';
    ul.classList.remove('hidden');
    const risultati = document.getElementById('risultatiTipo');
    risultati.innerHTML = '';

    ordinati.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.nome + " " + p.hp + " HP";
        ul.appendChild(li);

        const miniCard = document.createElement('div');
        miniCard.className = 'mini-card';
        miniCard.innerHTML = `
            <img src="${p.sprite}" alt="${p.nome}">
            <p>${p.nome.toUpperCase()}</p>
        `;
        miniCard.addEventListener('click', () => cercaPokemon(p.nome));
        risultati.appendChild(miniCard);
    });
}

function ordinaPokemonPerHp(lista) {
    return lista.sort((a, b) => b.hp - a.hp);
}


caricaDati();
// mostra i preferiti al caricamento della pagina
mostraPreferiti();

function resetUI() {
    document.getElementById('card').classList.add('hidden');
    document.getElementById('statsSection').classList.add('hidden');
    document.getElementById('listaPokemon').classList.add('hidden');
    document.getElementById('listaPokemon').innerHTML = '';
    document.getElementById('risultatiTipo').innerHTML = '';
    document.getElementById('tipoTitolo').innerHTML = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchInputByType').value = '';
}


// Esercizi forEach, map, filter
// Usa forEach per stampare in console 'Pikachu ha 35 HP' per ogni Pokémon.
pokemon.forEach(function (p) {
    console.log(p.nome + ' ha ' + p.hp + ' HP');
})

// Usa map per creare un nuovo array con solo {nome, hp} (senza tipo) per ogni Pokémon.
const nomeHp = pokemon.map(p => ({ nome: p.nome, hp: p.hp }));
console.log(nomeHp);

// Usa filter per ottenere solo i Pokémon con HP inferiore a 42.
const inferiori42 = pokemon.filter(p => p.hp < 42);
console.log(inferiori42);

// Ottieni i nomi (solo i nomi, stringa) dei Pokémon con HP >= 40, in maiuscolo.
const nomi = pokemon.filter(p => p.hp >= 40).map(p => ({ nome: p.nome.toUpperCase() }));
console.log(nomi);