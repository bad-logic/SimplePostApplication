const express = require('express');
const parser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';

module.exports = {
    PORT,
    HOST,
    express,
    parser
}