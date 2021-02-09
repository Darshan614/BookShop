const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.get('/add-book',isAuth, adminController.getAddBook);

router.get('/books',isAuth, adminController.getBooks);

router.post('/add-book'
			,[
	body('title').isLength({min:3}).trim(),
	body('price').isFloat(),
	body('description').isLength({min:5,max:100}).trim()
]
			,isAuth,adminController.postAddBook);

router.get('/edit-book/:bookId',isAuth,adminController.getEditBook);

router.post('/edit-book',[
	body('title').isLength({min:3}).trim(),
	body('price').isFloat(),
	body('description').isLength({min:10,max:100}).trim()
]
			,
			isAuth,adminController.postEditBook);

router.delete('/book/:bookId',isAuth,adminController.deleteBook);

module.exports = router ;