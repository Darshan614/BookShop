const Book = require('../models/book');
const Order = require('../models/order');

exports.getIndex = (req,res,next)=>{
    Book.find()
    .then(books=>{
        res.render('shop/index',{
            books: books,
            pageTitle:'shop',
            path:'/',
        });
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.getBooks = (req,res,next)=>{
    Book.find()
    .then(books=>{
        res.render('shop/book-list',{
            books:books,
            pageTitle:'All Books',
            path:'/books'
        });
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBook = (req,res,next)=>{
    const bookId = req.params.bookId;
    Book.findById(bookId)
    .then(book=>{
        res.render('shop/book-detail',{
            book:book,
            pageTitle:book.title,
            path:'/books'
        });
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getCart = (req,res,next)=>{
	console.log('inside getcart')
    req.user.populate('cart.items.bookId')
    .execPopulate()
    .then(user=>{
        const books = user.cart.items;
		console.log(books,'-books');
        res.render('shop/cart',{
            path:'/cart',
            pageTitle:'Your Cart',
            books:books
        });
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postCart = (req,res,next)=>{
	//console.log('MOTorcaR Yaliii')
    const bookId = req.body.bookId;
    Book.findById(bookId)
    .then(book=>{
        return req.user.addToCart(book);
    })
    .then(result=>{
		//console.log('hello')
        //console.log(result);
        res.redirect('/cart');
    })
	.catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteBook = (req,res,next)=>{
    const bookId = req.body.bookId;
    req.user
    .removeFromCart(bookId)
    .then(result=>{
        res.redirect('/cart');
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req,res,next)=>{
    Order.find({'user.userId':req.user._id})
    .then(orders=>{
        res.render('shop/orders',{
            path:'/orders',
            pageTitle:'Your Orders',
            orders:orders
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postOrder = (req,res,next)=>{
    req.user
    .populate('cart.items.bookId')
    .execPopulate()
    .then(user=>{
        const books = user.cart.items.map(i=>{
            return { quantity:i.quantity,book:{...i.bookId._doc}};
        });
		//console.log(books,'books')
        const order = new Order({
            user:{
                email:req.user.email,
                userId:req.user
            },
            books:books
        });
		//console.log(order,'order')
        return order.save()
    })
    .then(result=>{
        return req.user.clearCart();
    })
    .then(()=>{
        res.redirect('/orders');
    })
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}