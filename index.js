const mongoose = require('mongoose');
const Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

//mongoose.connect('mongodb://localhost:27017/mfDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

app.use(bodyParser.urlencoded({ extended: true}));

const cors = require('cors');
app.use(cors());

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

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

app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
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

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.get("/genre/:Name", passport.authenticate('jwt', { session: false }), async (req, res) => {
    Genres.findOne({ Name: req.params.Name })
        .then ((genre) => {
            res.json(genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.get("/director/:Name", passport.authenticate('jwt', { session: false }), async (req, res) => {
    Directors.findOne({ Name: req.params.Name })
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.post('/users', 
[
    check('Name', 'Name is required').isLength({min: 5}),
    check('Name', 'Name contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Name: req.body.Name })
    .then((user) => {
        if(user) {
            return res.status(400).send(req.body.Name + ' already exists');
        } else {
            Users
                .create({
                    Name: req.body.Name,
                    Password: hashedPassword,
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

app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/users/:Name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ Name: req.params.Name })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.put('/users/:Name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Name !== req.params.Name){
        return res.status(400).send('Permission denied');
    }
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

app.post('/users/:Name/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Name: req.params.Name }, {
        $push: { FavMovies: req.params.MovieID}
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

app.delete("/users/:Name/movies/:MovieID", passport.authenticate('jwt', { session: false }), async (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Name },{ $pull: { FavMovies: req.params.Title }}, {new: true})
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

app.delete('/users/:Name', passport.authenticate('jwt', { session: false }), async(req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});

