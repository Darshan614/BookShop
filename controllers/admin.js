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
    const title = req.body.title;
    const imgUrl = req.body.imgUrl;
    const price = req.body.price;
    const category = req.body.category;
    const description = req.body.description;
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).render('admin/edit-book',{
            pageTitle:'Add Book',
            path: 'admin/edit-book',
            editing: false,
			hasError:true,
            book:{
				title:title,
				imgUrl:imgUrl,
				price:price,
				description:description,
				category:category
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array() 
        });
}
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
    const updatedImgUrl = req.body.imgUrl;
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
				imgUrl:updatedImgUrl,
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
        book.imgUrl = updatedImgUrl;
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

exports.postDeleteBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    Book.deleteOne({_id:bookId,userId:req.user._id})
    .then(() => {
        console.log('DESTROYED Book');
        res.redirect('/admin/books');
      })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}