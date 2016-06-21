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
        // return Page.findByTag('bar')
        //   .then(function (pages) {
        //     expect(pages).to.have.lengthOf(1);
        //     done();
        //   })
        //   .catch(done);
        // });
      it('does not get pages without the search tag');
    });
  });

  describe('Instance methods', function () {
    describe('findSimilar', function () {
      it('never gets itself');
      it('gets other pages with any common tags');
      it('does not get other pages without any common tags');
    });
  });

  describe('Validations', function () {
    it('errors without title');
    it('errors without content');
    it('errors given an invalid status');
  });

  describe('Hooks', function () {
    it('it sets urlTitle based on title before validating');
  });

});
