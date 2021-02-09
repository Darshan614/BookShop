const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
	resetToken:String,
	resetTokenExpiration:Date,
    cart:{
        items:[
            {
                bookId:{
                    type:Schema.Types.ObjectId,
                    ref:'Book',
                    required:true
                },
                quantity:{type:Number,required:true}
            }
        ]
    }
});

userSchema.methods.addToCart = function(book){
    const cartBookIndex = this.cart.items.findIndex(cp=>{      //findIndex returns the index of the first element that passes a test given as a function
		console.log(cp,'cp')
		console.log(book,'book')
        return cp.bookId.toString() ===  book._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if(cartBookIndex>=0){
        newQuantity = this.cart.items[cartBookIndex].quantity+1;
        updatedCartItems[cartBookIndex].quantity = newQuantity;
    }else{
        updatedCartItems.push({
            bookId:book._id,
            quantity:newQuantity
        });
    }
    const updatedCart={
        items:updatedCartItems
    };
	console.log(updatedCart,'updatedCart')
    this.cart = updatedCart;
	console.log(this)
    return this.save();
};

userSchema.methods.removeFromCart = function(bookId){
    const updatedCartItems = this.cart.items.filter(item=>{
        return item.bookId.toString() !== bookId.toString();
    });
    this.cart.items=updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart={ items:[] };
    return this.save();
};

module.exports = mongoose.model('User',userSchema);