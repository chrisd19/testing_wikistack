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
chai.should();
chai.use(require('chai-things'));

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

      it('never gets itself', function (done) {
        pagesPromise
        .then(function (pages) {
          pages[0].findSimilar()
          .then(function (resultPages) {
            resultPages.should.not.include(pages[0]);
            expect(resultPages[0].title).to.eql('foo2');
            expect(resultPages).to.have.lengthOf(1);
            done();
          })
          .catch(done);
        });
      });

      it('gets other pages with any common tags', function (done) {
        pagesPromise
        .then(function (pages) {
          pages[0].findSimilar()
          .then(function (resultPages) {
            expect(resultPages[0].title).to.eql('foo2');
            expect(resultPages).to.have.lengthOf(1);
            done();
          })
          .catch(done);
        });
      });
      it('does not get other pages without any common tags', function (done) {
        pagesPromise
        .then(function (pages) {
          pages[0].findSimilar()
          .then(function (resultPages) {
            resultPages.should.not.include(pages[2]);
            expect(resultPages[0].title).to.eql('foo2');
            expect(resultPages).to.have.lengthOf(1);
            done();
          })
          .catch(done);
        });
      });
    });
  });

  describe('Validations', function () {

    var page;
    beforeEach(function (done) {
      page = Page.build({});
      done();
    });

    it('errors without title', function (done) {
      page.validate(function (page) {
        return page;
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
        done();
      });
    });

    it('errors without content', function (done) {
      page.validate(function (page) {
        return page;
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
        done();
      });
    });

    it('errors given an invalid status', function (done) {
      page.status = 'wrong'
      page.validate(function (page) {
        return page;
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
        done();
      });
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
  });

  describe('Hooks', function () {
    var pagePromise;
    beforeEach(function (done) {
      pagePromise = Page.create({
        title: 'fullstack_academy',
        content: 'tdd workshop'
      });
      done();
    });

    it('it sets urlTitle based on title before validating', function () {
      pagePromise
      .then(function (page) {
        expect(page.urlTitle).to.eql('fullstack_academy');
      });
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
  });

});
