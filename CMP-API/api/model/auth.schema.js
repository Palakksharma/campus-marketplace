// import mongoose from "mongoose"; 
// import bcrypt from "bcrypt";
// const authSchema = new mongoose.Schema({
// userName : {
// type:String,

// },
//  email:{
//     type:String,
//     required:true,

// },
// password:{
//    type:String,
//    required:true,
// },


// },
// {
//     timestamps: true,
// },
// );

//  authSchema.pre("save", async(next)=>{
//     try {
//        const salt = await bcrypt.genSalt(10);
//        console.log(this.password);
//        const hashedPassword= await bcrypt.hash(this.password, salt);
       
//        this.password = hashedPassword;
       
//     } catch (err) {
//         console.log(err)
//     }
//  });
//  authSchema.methods.comparePassword= async function(enteredPassword){
//    return await bcrypt.compare(enteredPassword, this.password);
//  };
//   export const Auth = mongoose.model("Auth",authSchema);

import mongoose from "mongoose"; 
import bcrypt from "bcrypt";

const authSchema = new mongoose.Schema({
  userName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  college:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",  //usko populate krte jiska ref hota hai
    //we use ref jb doosre schema ko refer krna ho
  },
  isVerified:{
    type: Boolean,
    default: false,
    
  },
  role:{
    type:String,
    enum: ["user", "admin"],
    default:"user",
  }
},
{
  timestamps: true,
}
);

// correct middleware (no next)
authSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});

// compare password
authSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Auth = mongoose.model("Auth", authSchema);