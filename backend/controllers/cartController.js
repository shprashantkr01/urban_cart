import userModel from "../models/userModel.js"


// add products to user cart
const addToCart = async (req,res) => {
    try {
        //Extract userId, itemID, size from req.boy
        const { userId, itemId, size } = req.body
        // Extract userData from Database Using UserId
        const userData = await userModel.findById(userId)
        //Extract cartData from Userdata
        let cartData = await userData.cartData;
        //If cart already have something then check if exact same item is present there 
        if (cartData[itemId]) {
            if (cartData[itemId][size]) {   //If yes then Just increase the product counter.
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1 //If not present then add the product
            }
        } else {
            cartData[itemId] = {}          //If cart is empty then simply add the item. 
            cartData[itemId][size] = 1
        }
        
        // Update the cartData in userModel.
        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }