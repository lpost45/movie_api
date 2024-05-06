const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

mongoose.connect('mongodb://localhost:27017/mfDB', { useNewUrlParser: true, useUnifiedTopology: true });

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
app.use(express.urlencoded({ extended: true}));

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
        title: 'Forrest Gump',
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
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});

app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.get("/genre/:Name", (req, res) => {
    Genres.findOne({ Name: req.params.Name })
        .then ((genre) => {
            res.json(genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.get("/director/:Name", (req, res) => {
    Directors.findOne({ Name: req.params.Name })
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.post('/users', async (req, res) => {
    await Users.findOne({ Name: req.body.Name })
    .then((user) => {
        if(user) {
            return res.status(400).send(req.body.Name + 'already exists');
        } else {
            Users
                .create({
                    Name: req.body.Name,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then ((user) =>{res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

app.get('/users', async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/users/:Name', async (req, res) => {
    await Users.findOne({ Name: req.params.Name })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.put('/users/:Name', async (req, res) => {
    await Users.findOneAndUpdate({ Name: req.params.Name }, { $set:
        {
            Name: req.body.Name,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

app.post('/users/:Name/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ Name: req.params.Name }, {
        $push: { favMovies: req.params.MovieID}
    },
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.delete("/users/:Name/movies/:MovieID", (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Name },{ $pull: { FavMovies: req.params.Title }}, {new: true})
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.delete('/users/:Name', async(req, res) => {
    await Users.findOneAndDelete({ Name: req.params.Name })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Name + ' was not found');
            } else {
                res.status(200).send(req.params.Name + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.listen(8080, () => {
    console.log('My app is listening on port 8080.');
});