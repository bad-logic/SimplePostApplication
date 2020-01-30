const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const file = require('fs');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
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
    file,
    path,
    multer,
    validationResult,
    morgan,
    bcrypt,
    mongoose,
    DB_NAME,
    DB_PORT
}