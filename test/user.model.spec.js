var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var marked = require('marked');
var models = require('../models');
var User = models.User;
chai.use(spies);
chai.should();
chai.use(require('chai-things'));
