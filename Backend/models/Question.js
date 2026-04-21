import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema ({
    question : {
        type : String,
        require : true 
    },
    options : {
        type : [String],
        require : true
    },
    score : {
        type : Number,
        require : true
        default : 1
    },
    creator_Id : { type : mongoose.Schema.Types.ObjectId, ref : 'User' }
}, {timestamps : true}) 

export default mongoose.model('Question', QuestionSchema)