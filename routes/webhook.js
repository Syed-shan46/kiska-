const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51PgKMqEcNOjPRL81rLSYSLoLIOHelMd40iQEhbI87QmjXzmKaQIndgy89ughFn4VXGzbfIYylKp8UH0rhINUk7zQ00hwvzBBDv');
const Order = require('../models/order_model');