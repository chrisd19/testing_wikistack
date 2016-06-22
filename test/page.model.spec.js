var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var marked = require('marked');
var models = require('../models');
var Page = models.Page;
chai.use(spies);
chai.should();
chai.use(require('chai-things'));

describe('Page model', function () {

  describe('Virtuals', function () {

    var page;
    beforeEach(function () {
      page = Page.build({});
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

      beforeEach(function () {
        return Page.create({
          title: 'foo',
          content: 'bar',
          tags: ['foo', 'bar']
        });
      });

      it('gets pages with the search tag', function () {
        return Page.findByTag('bar')
        .then(function (pages) {
          expect(pages).to.have.lengthOf(1);
        })
        .catch(console.error);
      });

      it('does not get pages without the search tag', function () {
        return Page.findByTag('tag1')
        .then(function (pages) {
          expect(pages).to.have.lengthOf(0);
        })
        .catch(console.error);
      });

      afterEach(function () {
        return Page.destroy({
          where: {
            title: 'foo'
          }
        })
        .then(function () {
          // destroy
        })
        .catch(console.error);
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

      it('never gets itself', function () {
        return pagesPromise
        .then(function (pages) {
          pages[0].findSimilar()
          .then(function (resultPages) {
            resultPages.should.not.include(pages[0]);
            expect(resultPages[0].title).to.eql('foo2');
            expect(resultPages).to.have.lengthOf(1);
          })
          .catch(console.error);
        });
      });

      it('gets other pages with any common tags', function () {
        return pagesPromise
        .then(function (pages) {
          pages[0].findSimilar()
          .then(function (resultPages) {
            expect(resultPages[0].title).to.eql('foo2');
            expect(resultPages).to.have.lengthOf(1);
          })
          .catch(console.error);
        });
      });

      it('does not get other pages without any common tags', function () {
        return pagesPromise
        .then(function (pages) {
          pages[0]
          .findSimilar()
          .then(function (resultPages) {
            resultPages.should.not.include(pages[2]);
            expect(resultPages[0].title).to.eql('foo2');
            expect(resultPages).to.have.lengthOf(1);
          })
          .catch(console.error);
        });
      });

      afterEach(function () {
        return Page.destroy({
          where: {
            content: 'bar'
          }
        })
        .then(function () {
          // destroy
        })
        .catch(console.error);
      });
    });
  });

  describe('Validations', function () {

    var page;
    beforeEach(function () {
      page = Page.build({});
    });

    it('errors without title', function () {
      return page.validate(function (page) {
        return page;
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
      })
      .catch(console.error);
    });

    it('errors without content', function () {
      return page.validate(function (page) {
        return page;
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
      })
      .catch(console.error);
    });

    it('errors given an invalid status', function () {
      page.status = 'wrong';
      return page.validate(function (page) {
        return page;
      })
      .then(function (err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
      });
    });

    afterEach(function () {
      return Page.destroy({
        where: {
          content: 'bar'
        }
      })
      .then(function () {
      })
      .catch(console.error);
    });
  });

  describe('Hooks', function () {
    var pagePromise;
    beforeEach(function () {
      pagePromise = Page.create({
        title: 'fullstack_academy',
        content: 'tdd workshop'
      });
    });

    it('it sets urlTitle based on title before validating', function () {
      return pagePromise
      .then(function (page) {
        expect(page.urlTitle).to.eql('fullstack_academy');
      });
    });

    afterEach(function () {
      return Page.destroy({
        where: {
          title: 'fullstack_academy'
        }
      })
      .then(function () {
      })
      .catch(console.error);
    });

  });

});
