import mongoose from 'mongoose';
import { Password } from '../services/password';

// This is an interface used to enforce type check
// for the new user objects passed into the schema constructor call with new keyword.
interface UserAttrs {
  email: string;
  password: string;
}

// step 5: an interface for user Document
// A user document represents a single record
// of the user collections. Please note to include
// the additional properties if any required over here iteself.
// In this case we do not access aby of it.
// Please see step 6.
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// step 3 : tell TS about the build method
// This is done by extending the model class in Mongoose
// and creating a new interface as below.
// please see step 4 below.
// interface UserModel extends mongoose.Model<any> {
//   build(attrs: UserAttrs): any;
// }
// step 6:
// Please refer the new interface useDoc in place of any data types below.
// Please see the step 7 below.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  // Please be noted that Mongoose will treat the password
  // of a new user creation also as modified.
  // This check will also exclude the case of email modification event
  // even though this functionality is not implemented at this point in time.
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// step 1 : Adding the method build
// statistics is the property to add a method to the model
// as the provision given the Mongoose team.
// By this there is no need to have a separate custom function
// like the one - buildUser. As a result there is nothing to
// export and import in this regard. It means this function
// has got integrated into the model object.
// Please see step 1 below.
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// step 4:
// Pass the new interface as below, this shall complete the steps.
// And the build method now will be able to accept the values as
// shown under the code label testing.
// Although the code has now started working, it adds a few
// new mystery syntax like <any>, any and <any, UserModel>.
// This is to be discussed in the next video.
// Please see step 5 for the same.
// const User = mongoose.model<any, UserModel>('User', userSchema);
// step 7
// Please refer the interface userDoc in place the type any in the below statement.
// Please perform a test using the code under the section testing.
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// step 2 : testing the built
//It throws an error on the call to build method. Please see the call below.
//This is because TS and Mongoose fail to collaborate. Although the method build
//has now been integrated into the model, TS is not able to identify this new addition
//as a compliant one. It reports it as below
//property 'build' does not exist on type 'Model<{ email: string; password: string; }, ....
// Please see step 3 above.

//testing:
// By performing the steps 5,6 and 7, we have got the
// exact user record we created. Without these steps,
// the user object returned below would have included
// all of the additional fields added by Mongoose.
// This is the issue #2 which has not got addressed here.
// const user = User.build({
//   email: 'a@a.com',
//   password: 'pwd',
// });

// const buildUser = (user: UserAttrs) => {
//   new User(user);
// };

//export { User, buildUser };
export { User };
