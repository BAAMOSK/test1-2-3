const express = require('express');
const app = express();
const port = 3001;
const message = `Server is running on port: ${port}`;
const mongoose = require('mongoose');
const jsonParser = require('body-parser').json();

mongoose.connect('mongodb://localhost/test/blogs/posts');
mongoose.Promise = global.Promise;
app.use(jsonParser);

//Does not work because Blogs is class/model/IDK?
// Blogs.prototype.error = function(err, res) {
//   console.error(err);
//   res.status(500).send('Internal Server Error');
// };

//Schema
const structure = mongoose.Schema({
  title: String,
  content: String,
  author: String,
  created: {type: Date, default: Date.now}
});
//Model --1st param is name of collection --2nd is schema
//Mongoose requires you to model your data
const Blogs = mongoose.model('blogs', structure);

app.get('/posts', (req, res) => {
  Blogs
  .find()
  .then(results => {
    res.json(results);
  });
});

app.get('/posts/:id', (req, res) => {
  Blogs
  .findById(req.params.id)
  .then(blog => res.json(blog))
  .catch(err => {
    console.error(err);
    //204 error is no content -- server processed the request but no content
    res.status(204).send(err);
  });
});

app.post('/posts', (req, res) => {
  //validation check
  const required = ['title', 'content', 'author'];
  for(let i = 0; required.length; i++) {
    if(!(req.body in required[i])) {
      const err = `Missing ${required[i]}`;
      console.error(err);
      //206 partial content
      res.status(400).send(err);
    }      
  }  
  Blogs
  .create({
    title: req.body.title,
    author: req.body.author,
    content: req.body.content    
  })
  .then(result => {
    res.send(result);
  });
  // .catch(err => 
  // console.error(err));  
});

app.put('/posts/:id', (req, res) => {
  //Why do we always declare the model each time? Violates DRY rule******************
  Blogs
  .findByIdAndUpdate(req.params.id, { $set: { author: req.body.author, title: req.body.title, content: req.body.content } }, { new: true })
  //expects a json object to be returned
  //expects a status code 201
  .then(result => {
    res.status(201).json(result);
  });
});

app.delete('/posts/:id', (req, res) => {
  Blogs
  .findByIdAndRemove(req.params.id)
  .then( (deleted) => {
    console.log(deleted);
    res.status(204);//.end();
  });
});

//Run server
app.listen(port, () => console.log(message));