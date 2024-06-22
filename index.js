const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static('public'));

async function getDbCollection(dbAddress, dbName, dbCollectionName){
	const client = new MongoClient(dbAddress);
	await client.connect();
	const db = client.db(dbName);
	return db.collection(dbCollectionName);
}

app.get('/articles', async function(req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
	const data = await collection.find({}).toArray();
	res.send(data);
});

app.get('/articles/:id', async function(req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles');
	const data = await collection.findOne({_id: new ObjectId(req.params.id)});
	res.send(data);
});

app.post('/articles', async function(req, res) {
	const task = {...req.body, done: false};
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles')
	await collection.insertOne(task);
	res.send(task);
});

app.patch('/articles/:id', async function(req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles')
	const data = await collection.updateOne({_id: new ObjectId(req.params.id)}, 	
											{'$set': req.body});
	res.send({});
});

app.delete('/articles/:id', async function(req, res) {
	const collection = await getDbCollection('mongodb://127.0.0.1', 'todoapp', 'Articles')
	await collection.deleteOne({_id: new ObjectId(req.params.id)});
	res.send({});
});

app.listen(port, function() {
	console.log('Server is started!');
});