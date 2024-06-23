const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

async function getDbCollection(dbAddress, dbName, dbCollectionName) {
  const client = new MongoClient(dbAddress);
  await client.connect();
  const db = client.db(dbName);
  return db.collection(dbCollectionName);
}

app.get('/articles', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const data = await collection.find({}).toArray();
  res.send(data);
});

app.get('/articles/:id', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const data = await collection.findOne({ _id: new ObjectId(req.params.id) });
  res.send(data);
});

app.post('/articles', async function (req, res) {
  const task = { ...req.body, done: false, comments: [], likes: 0 };
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  await collection.insertOne(task);
  res.send(task);
});

app.patch('/articles/:id', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const data = await collection.updateOne({ _id: new ObjectId(req.params.id) }, { '$set': req.body });
  res.send({});
});

app.delete('/articles/:id', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.send({});
});

app.post('/articles/:id/comments', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const article = await collection.findOne({ _id: new ObjectId(req.params.id) });
  if (!article) return res.status(404).send('Article not found');

  const comment = { ...req.body, _id: new ObjectId().toString(), likes: 0 };
  article.comments.push(comment);

  await collection.updateOne({ _id: new ObjectId(req.params.id) }, { '$set': { comments: article.comments } });
  res.send(article);
});

app.patch('/articles/:articleId/comments/:commentId', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const article = await collection.findOne({ _id: new ObjectId(req.params.articleId) });
  if (!article) return res.status(404).send('Article not found');

  const comments = article.comments.map(comment => {
    if (comment._id === req.params.commentId) {
      return { ...comment, ...req.body };
    }
    return comment;
  });

  await collection.updateOne({ _id: new ObjectId(req.params.articleId) }, { '$set': { comments } });
  res.send(article);
});

app.delete('/articles/:articleId/comments/:commentId', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const article = await collection.findOne({ _id: new ObjectId(req.params.articleId) });
  if (!article) return res.status(404).send('Article not found');

  const comments = article.comments.filter(comment => comment._id !== req.params.commentId);
  await collection.updateOne({ _id: new ObjectId(req.params.articleId) }, { '$set': { comments } });
  res.send(article);
});

app.patch('/articles/:id/like', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  await collection.updateOne({ _id: new ObjectId(req.params.id) }, { '$inc': { likes: 1 } });
  const article = await collection.findOne({ _id: new ObjectId(req.params.id) });
  res.send(article);
});

app.patch('/articles/:articleId/comments/:commentId/like', async function (req, res) {
  const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
  const article = await collection.findOne({ _id: new ObjectId(req.params.articleId) });
  if (!article) return res.status(404).send('Article not found');

  const comments = article.comments.map(comment => {
    if (comment._id === req.params.commentId) {
      comment.likes += 1;
    }
    return comment;
  });

  await collection.updateOne({ _id: new ObjectId(req.params.articleId) }, { '$set': { comments } });
  res.send(article);
});

app.listen(port, function () {
  console.log('Server is started!');
});
