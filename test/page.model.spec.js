var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var supertest = require('supertest');
var Sequelize = require('sequelize');
var marked = require('marked');
var app = require('../app');
var models = require('../models');
var Page = models.Page;
var User = models.User;
chai.use(spies);


describe('Page model', function () {

  describe('Virtuals', function () {
    var page;
    beforeEach(function(done) {
      page = Page.build({});
      done();
    });
    describe('route', function () {
      it('returns the url_name prepended by "/wiki/"', function() {
        page.urlTitle = 'Random_Title';
        expect(page.route).to.eql("/wiki/" + 'Random_Title');
      });
    });
    describe('renderedContent', function () {
      it('converts the markdown-formatted content into HTML', function() {
        page.content = 'Here is some content!!!';
        expect(page.renderedContent).to.eql(marked(page.content));
      });
    });
  });

  describe('Class methods', function () {
    describe('findByTag', function () {

      beforeEach(function(done) {
        Page.create({
          title: 'foo',
          content: 'bar',
          tags: ['foo', 'bar']
        })
        .then(function () {
          done();
        })
        .catch(done);
      });

      // beforeEach(function () {
      // return Promise.all([
      // Page.create({
      //   title: 'foo',
      //   content: 'bar',
      //   tags: ['foo', 'bar']
      // }),
      //   Page.create({
      //     title: 'foo2',
      //     content: 'bar2',
      //     tags: ['foo2', 'bar']
      //   })
      // ]);
      it('gets pages with the search tag', function (done) {
        Page.findByTag('bar')
        .then(function (pages) {
          expect(pages).to.have.lengthOf(1);
          done();
        })
        .catch(done);
      });
      it('does not get pages without the search tag', function (done) {
        Page.findByTag('tag1')
        .then(function (pages) {
          expect(pages).to.have.lengthOf(0);
          done();
        })
        .catch(done);
      });

      afterEach(function (done) {
        Page.destroy({
          where: {
            title: 'foo'
          }
        })
        .then(function () {
          done();
        })
        .catch(done);
      });

    });
  });

  describe('Instance methods', function () {
    describe('findSimilar', function () {

      var pagePromise;
      beforeEach(function() {
        pagePromise = Promise.all([
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
          ])
      });

      afterEach(function (done) {
        Page.destroy({
          where: {
            content: 'bar'
          }
        })
        .then(function () {
          done();
        })
        .catch(done);
      });

      it('never gets itself', function(done) {
        pagePromise.then(function(pages) {
          return pages[0];
        }).then(function(page) {
          page.findSimilar()
            .then(function (pages) {
              expect(pages[0].title).to.eql('foo2');
              expect(pages).to.have.lengthOf(1);
              done();
            })
            .catch(done);
        });
      });
      it('gets other pages with any common tags', function(done) {
        pagePromise.then(function(pages) {
          return pages[0];
        }).then(function(page) {
          page.findSimilar()
            .then(function (pages) {
              expect(pages[0].title).to.eql('foo2');
              expect(pages).to.have.lengthOf(1);
              done();
            })
            .catch(done);
        });
      });
      it('does not get other pages without any common tags', function(done) {
        pagePromise.then(function(pages) {
          return pages[0];
        }).then(function(page) {
          page.findSimilar()
            .then(function (pages) {
              expect(pages[0].title).to.eql('foo2');
              expect(pages).to.have.lengthOf(1);
              done();
            })
            .catch(done);
        });
      });
    });
  });

  describe('Validations', function () {
    var pagePromise;
    beforeEach(function () {
        pagePromise = Page.build({
          title: null,
          content: null,
          status: 'something'
        });
      });

    it('errors without title', function (done) {
      pagePromise
      .then(function(page) {
        return page.validate();
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
        done();
      })
    });
    it('errors without content');
    it('errors given an invalid status');

    afterEach(function (done) {
        Page.destroy({
          where: {
            content: 'bar'
          }
        })
        .then(function () {
          done();
        })
        .catch(done);
      });
  });

  describe('Hooks', function () {
    it('it sets urlTitle based on title before validating');
  });

});
