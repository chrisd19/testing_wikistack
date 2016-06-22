var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var supertest = require('supertest');
var app = require('../app');
var models = require('../models');
var Page = models.Page;
chai.use(spies);
chai.should();
chai.use(require('chai-things'));
var agent = supertest.agent(app);

describe('http requests for /wiki', function () {
    describe('GET /wiki/', function () {
        it('responds with 200', function () {
            agent
            .get('/wiki')
            .expect(200);
        });
    });

    describe('GET /wiki/add', function () {
        it('responds with 200', function() {
            agent
            .get('/wiki/add')
            .expect(200);
        });
    });

    describe('GET /wiki/:urlTitle', function () {

        var pagePromise;
        beforeEach(function () {
           pagePromise = Page.create({
            title: 'tdd workshop',
            content: 'tests',
            statur: 'open'
           });
        });

        it('responds with 404 on page that does not exist', function () {
            agent
            .get('/wiki/subtract')
            .expect(404);
        });

        it('responds with 200 on page that does exist', function() {
            return pagePromise.then(function (page) {
                agent
                .get('/wiki/tdd_workshop')
                .expect(200);
            });
        });

        afterEach(function () {
            return Page.destroy({
                where: {
                  title: 'tdd workshop'
                }
              })
              .then(function () {
              })
              .catch(console.error);
        });
    });

    describe('GET /wiki/search', function () {
        it('responds with 200', function() {
            agent
            .get('/wiki/search')
            .expect(200);
        });
    });

    describe('GET /wiki/:urlTitle/similar', function () {
        var pagesPromise;
          beforeEach(function() {
            pagesPromise = Promise.all([
             Page.create({
              title: 'foo',
              content: 'bar',
              tags: ['foo', 'bar']
            }),
             Page.create({
              title: 'foo2',
              content: 'bar',
              tags: ['foo', 'tag1']
            }),
             Page.create({
              title: 'foo3',
              content: 'bar',
              tags: ['tag2', 'tag3']
            })
             ]);
          }); // end beforeEach

        it('responds with 404 for page that does not exist', function() {
            agent
            .get('wiki/whatever/similar')
            .expect(404);
        });

        it('responds with 200 for similar page', function() {
            agent
            .get('wiki/foo/similar')
            .expect(200);
        });

        afterEach(function () {
            return Page.destroy({
                where: {
                    content: 'bar'
                }
            });
        });
    });

    describe('POST /wiki', function () {
        it('responds with 302', function () {
            agent
            .post('/wiki')
            .send({
                name: 'Tammy',
                email: 'tc@gmail.com',
                title: 'tdd',
                content: 'workshop',
                status: 'open'
            })
            .expect(302)
            .end(function (err, res) {
            });
        });

        it('creates a page in the database', function (){
            Page.findOne({
                where:{
                    title: 'tdd',
                    content: 'workshop'
                }
            }).then(function (page) {
                expect(page.title).to.eql('tdd');
                Page.destroy({
                    where: {
                        title: 'tdd',
                        content: 'workshop'
                    }
                });
            });
        });

    });
});
