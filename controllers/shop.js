const fs = require('fs');//node module for file handling
const path = require('path');//node module,works on all operatingsys.
const stripe = require('stripe')('sk_test_51IIwkrIAShPifzT0mWvMCw7riPsQbS7IKNiDjaLtDZzMDAexSgT85v8rXAtqg8DyaMgb7AykU3Xuv1jA5TqieKiW00BcidtSM6');
const PDFDocument = require('pdfkit');
const Book = require('../models/book');
const Order = require('../models/order');


exports.getIndex = (req,res,next)=>{
	let page;
	if(req.query.page){
		page = req.query.page;
	}
	else{
		page = 'Fiction';
	}
	//console.log('page',page);
    Book.find({'category':page})
    .then(books=>{
		//console.log(books);
        res.render('shop/index',{
            books: books,
			page: page,
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

exports.getCheckout = (req,res,next)=>{
	let books;
	let total=0;
	console.log('inside checkout');
	req.user.populate('cart.items.bookId')
    .execPopulate()
    .then(user=>{
        books = user.cart.items;
		console.log(books,'-books');
		total = 0;
		books.forEach(p=>{
			total+=p.quantity*p.bookId.price;
		});
		return stripe.checkout.sessions.create({
			payment_method_types:['card'],
			line_items:books.map(b=>{
				return{
					name:b.bookId.title,
					description:b.bookId.description,
					amount:b.bookId.price*100,
					currency:'usd',
					quantity:b.quantity
				} 
			}),
			success_url:req.protocol+'://'+req.get('host')+'/checkout/success',
			cancel_url:req.protocol+'://'+req.get('host')+'/checkout/cancel'
		});
    })
	.then(session=>{
		console.log('going to checkout');
        res.render('shop/checkout',{
            path:'/checkout',
            pageTitle:'Checkout',
            books:books,
			totalSum:total,
			sessionId:session.id
        });
	})
    .catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req,res,next)=>{
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

exports.getInvoice = (req,res,next)=>{
	const orderId = req.params.orderId;
	Order.findById(orderId).then(order=>{
		if(!order){
			console.log('no order');
			return next(new Error('No order found'))
		}
		if(order.user.userId.toString()!==req.user._id.toString()){
			console.log('not authorised');
			return next(new Error('Unauthorized'));
		}
		const invoiceName ='invoice-'+orderId+'.pdf';
	//console.log('invoiceName-',invoiceName);
	const invoicePath = path.join('data','invoices',invoiceName);
	const pdfDoc = new PDFDocument();
	res.setHeader('Content-Type','application/pdf');
	res.setHeader('Content-Disposition','inline; filename="' + invoiceName+'"');
	pdfDoc.pipe(fs.createWriteStream(invoicePath));
	pdfDoc.pipe(res);
	pdfDoc.fontSize(26).text('Invoice',{
		underline:true
	});
	pdfDoc.text('----------------------');
	let totalPrice=0;
	order.books.forEach(bok=>{
		totalPrice += bok.quantity * bok.book.price;
		pdfDoc.fontSize(18).text(bok.book.title+'-'+bok.quantity+' X '+'$ '+bok.book.price);
	})
	pdfDoc.text('----');
	pdfDoc.fontSize(22).text('Total Price: $'+totalPrice);
	pdfDoc.end();
		
	//console.log('inside invoice-',invoicePath);
	// fs.readFile(invoicePath,(err,data)=>{
	// 	if(err){
	// 		console.log('error occ',err);
	// 		return next(err);
	// 	}
	// 	res.setHeader('Content-Type','application/pdf');
	// 	res.setHeader('Content-Disposition','inline; filename="' + invoiceName+'"');
	// 	res.send(data);
	// });
		// const file = fs.createReadStream(invoicePath);
		// res.setHeader('Content-Type','application/pdf');
		// res.setHeader('Content-Disposition','inline; filename="' + invoiceName+'"');
		// file.pipe(res);
		// console.log('at end');
	}).catch(err=>{
		console.log('err occerd',err);
		next(err)});
	
}