const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const { check, body, validationResult } = require('express-validator');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || 'blog_post';
module.exports = {
    PORT,
    HOST,
    express,
    parser,
    check,
    body,
    validationResult,
    mongoose,
    DB_NAME,
    DB_PORT
}