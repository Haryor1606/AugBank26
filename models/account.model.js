// const mongoose= require("mongoose");

// const AccountSchema = new mongoose.schema({
//     accountNumber:{type:"String", required:true, unique:true}
// }, {strict:"throw", timestamps:true})










// const AccountModel=mongoose.model("account", AccountSchema)

// module.exports= AccountModel

// // const updateUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // comes from verifyUser middleware

//     const { firstname, lastname, email, tag, password } = req.body;

   
//     const updates = {};

//     if (firstname !== undefined) updates.firstname = firstname;
//     if (lastname !== undefined) updates.lastname = lastname;
//     if (email !== undefined) updates.email = email;
//     if (tag !== undefined) updates.tag = tag;

//     if (password) {
//       const saltround = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(password, saltround);
//     }

//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       updates,
//       { new: true, runValidators: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).send({
//         message: "User not found",
//       });
//     }

//     res.status(200).send({
//       message: "User updated successfully",
//       data: updatedUser,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).send({
//         message: "Email or tag already exist",
//       });
//     }

//     res.status(400).send({
//       message: "User cannot be updated at this time",
//     });
//   }
// };