
const Book = require('../models/book');

exports.getAddBook = (req,res,next)=>{
    res.render('admin/edit-book',{
        pageTitle:'Add-book',
        path:'/admin/add-book',
        editing:false
    });
};

exports.getBooks = (req,res,next)=>{
    Book.find()
    .then(books=>{
        console.log(books);
        res.render('admin/books',{
            prods:books,
            pageTitle:'Admin Products',
            path:'/admin/books'
        });
    })
    .catch(err => console.log(err));
}

exports.postAddBook = (req,res,next)=>{
    const title = req.body.title;
    const imgUrl = req.body.imgUrl;
    const price = req.body.price;
    const category = req.body.category;
    const description = req.body.description;
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
        res.redirect('/admin/products')
    }) 
    .catch(err=>{
        console.log(err);
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
            book:book
        });
    })
    .catch(err=>console.log(err));
}

exports.postEditBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImgUrl = req.body.imgUrl;
    const updatedDesc = req.body.description;
    const updatedCategory = req.body.category;

    Book.findById(bookId)
    .then(book=>{
        book.title = updatedTitle;
        book.price = updatedPrice;
        book.category = updatedCategory;
        book.imgUrl = updatedImgUrl;
        book.description = updatedDesc;
        return book.save();
    })
    .then(result=>{
        console.log('Updated Product');
        res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
}

exports.postDeleteBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    Book.findByIdAndRemove(bookId)
    .then(() => {
        console.log('DESTROYED Book');
        res.redirect('/admin/books');
      })
    .catch(err => console.log(err));
}const Book = require('../models/book');

exports.getAddBook = (req,res,next)=>{
    res.render('admin/edit-book',{
        pageTitle:'Add-book',
        path:'/admin/add-book',
        editing:false
    });
};

exports.getBooks = (req,res,next)=>{
    Book.find()
    .then(books=>{
        console.log(books);
        res.render('admin/books',{
            prods:books,
            pageTitle:'Admin Products',
            path:'/admin/books'
        });
    })
    .catch(err => console.log(err));
}

exports.postAddBook = (req,res,next)=>{
    const title = req.body.title;
    const imgUrl = req.body.imgUrl;
    const price = req.body.price;
    const category = req.body.category;
    const description = req.body.description;
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
        res.redirect('/admin/products')
    }) 
    .catch(err=>{
        console.log(err);
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
            book:book
        });
    })
    .catch(err=>console.log(err));
}

exports.postEditBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImgUrl = req.body.imgUrl;
    const updatedDesc = req.body.description;
    const updatedCategory = req.body.category;

    Book.findById(bookId)
    .then(book=>{
        book.title = updatedTitle;
        book.price = updatedPrice;
        book.category = updatedCategory;
        book.imgUrl = updatedImgUrl;
        book.description = updatedDesc;
        return book.save();
    })
    .then(result=>{
        console.log('Updated Product');
        res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
}

exports.postDeleteBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    Book.findByIdAndRemove(bookId)
    .then(() => {
        console.log('DESTROYED Book');
        res.redirect('/admin/books');
      })
    .catch(err => console.log(err));
}