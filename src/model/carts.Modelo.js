import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const cartSchema=new mongoose.Schema({
    items: [{ productId:
        {
        type: mongoose.Schema.Types.ObjectId,
        ref:"productos"
        },
        quantity: {type:Number, default:1}
        }],
},
{
    timestamps: true
});

cartSchema.pre("find", function(){this.populate('items.productId').lean()})
cartSchema.plugin(paginate)

//Modelo del cart
export const cartModelo=mongoose.model("cart", cartSchema);