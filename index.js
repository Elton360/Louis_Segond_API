const express = require('express');
const fs = require('fs');

const app = express();

const full_book = JSON.parse(fs.readFileSync(`${__dirname}/full.json`));

const bookNameNormalizer = (book) => {
  const capitalized = book.charAt(0).toUpperCase() + book.slice(1);
  return capitalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

//Handling bad requests with specific messages
const bookChecker = (book, res) => {
  if (!full_book.hasOwnProperty(book)) {
    return res.status(404).json({
      status: 'fail',
      message: 'unknkown book title',
    });
  }
};

const chapterChecker = (book, chapter, res) => {
  bookChecker(book);

  if (
    isNaN(chapter) ||
    chapter < 1 ||
    chapter > Object.keys(full_book[book]).length
  ) {
    return res.status(404).json({
      status: 'fail',
      message: `${
        isNaN(chapter) ? 'chapter must be a number' : 'chapter is out of range'
      }`,
    });
  }
};

const verseChecker = (verse, book, chapter, res) => {
  chapterChecker(book, chapter, res);

  if (
    isNaN(verse) ||
    verse < 0 ||
    verse > full_book[book][`chapter${chapter}`].length
  ) {
    return res.status(404).json({
      status: 'fail',
      message: `${
        isNaN(verse) ? 'verse must be a number' : 'verse is out of range'
      }`,
    });
  }
};

//Handles all successfull requests dynamically
const successHandler = (res, data) => {
  return res.status(200).json({
    status: 'success',
    data,
  });
};

app.get('/api/v1/LSG', (req, res) => successHandler(res, full_book));

app.get('/api/v1/LSG/:book?', (req, res) => {
  const book = bookNameNormalizer(req.params.book);

  bookChecker(book, res);
  successHandler(res, full_book[book]);
});

app.get('/api/v1/LSG/:book?/:chpt?', (req, res) => {
  const book = bookNameNormalizer(req.params.book);
  const chapter = parseInt(req.params.chpt);

  chapterChecker(book, chapter, res);
  successHandler(res, full_book[book][`chapter${chapter}`]);
});

app.get('/api/v1/LSG/:book?/:chpt?/:verse', (req, res) => {
  const book = bookNameNormalizer(req.params.book);
  const chapter = parseInt(req.params.chpt);
  const verse = parseInt(req.params.verse) - 1;

  verseChecker(verse, book, chapter, res);

  successHandler(res, full_book[book][`chapter${chapter}`][verse]);
});

app.listen(7777, () => console.log('Running on the holy port!'));
