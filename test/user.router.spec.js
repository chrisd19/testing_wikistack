var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var supertest = require('supertest');
var app = require('../app');
var models = require('../models');
var User = models.User;
var agent = supertest(app);
chai.use(spies);
chai.should();
chai.use(require('chai-things'));


describe('http requests for /users route', function () {

  describe('GET /users/', function () {
    it('responds with 200', function (done) {
        agent
        .get('/users/')
        .expect(200)
        .end(function (err, res) {
            if (err) throw err;
            done();
        });
    });
  });

  describe('GET /users/:userId', function () {
    var user;
    beforeEach(function () {
        user = User.create({
            name: 'TC',
            email: 'tc@gmail.com'
        });
    });

    it('responds with 200', function(done) {
        return user
        .then(function (user) {
            agent
            .get('/users/' + user.id)
            .expect(200).end(function (err, res) {
                if (err) throw err;
                done();
            });
        });
    });

    afterEach(function () {
        return User.destroy({
            where: {
                name: 'TC'
            }
        })
        .then(function () {
          // destroy
        })
        .catch(console.error);
    });
  });

});
