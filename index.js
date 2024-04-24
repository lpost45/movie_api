const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

const bodyParser = require('body-parser');
const uuid = require('uuid');

app.use(bodyParser.json());

let user = [
    {
    id: '1',
    name: 'John Smith',
    emial: 'jsmith@mail.com',
    favMovies: [{
        title: 'Forest Gump',
        genre: 'Comedy',
        director: 'Robert Zemeckis'
    }]
}];

let topMovies = [
    {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        genre: 'Thriller'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola',
        genre: 'Crime'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan',
        genre: 'Action'
    },
    {
        title: 'The Godfather Part 2',
        director: 'Francis Ford Coppola',
        genre: 'Crime'
    },
    {
        title: '12 Angry Men',
        director: 'Sidney Lumet',
        genre: 'Crime'
    },
    {
        title: 'The Lord of the Rings: Return of the King',
        director: 'Peter Jackson',
        genre: 'Fantasy'
    },
    {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino',
        genre: 'Crime'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: 'Peter Jackson',
        genre: 'Fantasy'
    },
    {
        title: 'Forest Gump',
        director: 'Robert Zemeckis',
        genre: 'Comedy'
    },
    {
        title: 'The Lord of the Rings: The Two Towers',
        director: 'Peter Jackson',
        genre: 'Fantasy'
    }
];

app.get('/', (req, res) => {
    res.send('Welcome to MyFlix')
});

app.use(express.static('public'));

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

app.get('/movies/:title', (req, res) => {
    res.json(topMovies.find((movie) => {
        return movie.title === req.params.title
    }));
});

app.get('/movies/:title/genre', (req, res) => {
    let movie = topMovies.find((movie) => {
        return movie.title === req.params.title
    });
    if (movie) {
        res.status(200).json(movie.genre);
    }
    else {
        res.status(404).send('Movie not found');
    }
});

app.get('/movies/director/:name', (req, res) => {
    res.send('Successful GET request for director information');
});

app.post('/users', (req, res) => {
    let newUser = req.body;
    if (!newUser.name) {
        const message = 'Missing "name" in request';
        res.status(400).send(message);
    } else{
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

app.put('/users/:id', (req, res) => {
    res.send('Successful PUT request to update user')
});

app.post('/users/:id/:title', (req, res) => {
    res.send('Successful POST request to update users favMovies');
});

app.delete('/users/:id/:title', (req, res) => {
    res.send('Successful DELETE request to delete users favMovies');
});

app.delete('/users/:id', (req, res) => {
    res.send('Successful DELETE request to delete user');
});

app.listen(8080, () => {
    console.log('My app is listening on port 8080.');
});