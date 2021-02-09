const mongoose = require('mongoose');
const fileHelper = require('../util/file'); 
const { validationResult } = require('express-validator/check');
const Book = require('../models/book');

exports.getAddBook = (req,res,next)=>{
	//console.log('inside add book')
    res.render('admin/edit-book',{
        pageTitle:'Add-book',
        path:'/admin/add-book',
        editing:false,
		hasError:false,
		errorMessage: null,
		validationErrors:[]
    });
};

exports.getBooks = (req,res,next)=>{
    Book.find()
    .then(books=>{
        //console.log(books);
        res.render('admin/books',{
            books:books,
            pageTitle:'Admin Books',
            path:'/admin/books'
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postAddBook = (req,res,next)=>{
	console.log('inside postAddBook');
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const category = req.body.category;
    const description = req.body.description;
	console.log(image);
	if(!image){
		return res.status(422).render('admin/add-book',{
            pageTitle:'Add Book',
            path: 'admin/add-book',
            editing: false,
			hasError:true,
            book:{
				title:title,
				price:price,
				description:description,
				category:category
			},
			errorMessage: 'Attached file is not image',
			validationErrors: []
        });
	}
	
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).render('admin/edit-book',{
            pageTitle:'Add Book',
            path: 'admin/edit-book',
            editing: false,
			hasError:true,
            book:{
				title:title,
				price:price,
				description:description,
				category:category
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array() 
        });
}
	const imgUrl = image.path;
    const book = new Book({
        title:title,
        imgUrl:imgUrl,
        price:price,
        category:category,
        description:description,
        userId:req.user
    });
    book.save()
    .then(result=>{
        console.log('Created Product');
        res.redirect('/admin/books')
    }) 
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getEditBook = (req,res,next)=>{
    const editMode = req.query.edit;//this line is probably used in sql and so needs to be tested
    if(!editMode){
        return res.redirect('/');
    }
    const bookId = req.params.bookId;
    Book.findById(bookId)
    .then(book=>{
        if(!book){
            return res.redirect('/');
        }
        res.render('admin/edit-book',{
            pageTitle:'Edit Book',
            path: 'admin/edit-book',
            editing: editMode,//this also
            book:book,
			hasError:false,
			errorMessage: null,
			validationErrors:[]
        });
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postEditBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
    const updatedCategory = req.body.category;
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).render('admin/edit-book',{
            pageTitle:'Edit Book',
            path: 'admin/edit-book',
            editing: true,
			hasError:true,
            book:{
				title:updatedTitle,
				price:updatedPrice,
				description:updatedDesc,
				category:updatedCategory,
				_id:bookId
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array()
        });
}

    Book.findById(bookId)
    .then(book=>{
		if(book.userId.toString()!==req.user._id.toString()){
			return res.redirect('/');
		}
        book.title = updatedTitle;
        book.price = updatedPrice;
        book.category = updatedCategory;
		if(image){
			fileHelper.deleteFile(book.imgUrl);
			book.imgUrl=image.path;
		}
        book.description = updatedDesc;
        return book.save().then(result=>{
        console.log('Updated Product');
        res.redirect('/admin/books');
    })
    })
    
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.deleteBook = (req,res,next)=>{
    const bokId = req.params.bookId;
	console.log(bokId);
	Book.findById(bokId).then(book=>{
		if(!book){
			return next(new Error('Book not found.'));
		}
		fileHelper.deleteFile(book.imgUrl);
		return Book.deleteOne({_id:bokId,userId:req.user._id});
	}).then(() => {
        console.log('DESTROYED Book');
        res.status(200).json({message:'Success!'});
      })
    .catch(err => {
      res.status(500).json({message:'Deletion failed'});
    });
	}
    
    