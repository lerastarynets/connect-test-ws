require('dotenv').config();

const express = require('express');
const http = require('http');
const { join } = require('path');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });


mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const schema = new mongoose.Schema({
    foo: String
});

const Model = mongoose.model('Test', schema);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('getData', async () => {
        try {
            const doc = await Model.findOne({}, {_id: 0, __v: 0});
            if (doc) {
                socket.emit('data', doc);
            } else {
                socket.emit('data', { message: 'No data found' });
            }
        } catch (err) {
            console.error(err);
            socket.emit('data', { error: 'Error fetching data from database' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});