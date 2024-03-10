import mongoose, { Schema, Model, Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../utils/jwt';
import Joi from 'joi';
import { bcrypt } from 'bcrypt';
export interface User extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    projects: Types.ObjectId[];
    password: string;
    isAdmin: boolean;
    generateAuthToken(): string;
}

// User schema
const userSchema = new Schema<User>(
    {
        name: { type: String, minlength: 3, maxlength: 50, required: true },
        email: {
            type: String,
            minlength: 5,
            maxlength: 255,
            required: true,
            unique: true,
            lowercase: true,
        },
        projects: {
            type: [Types.ObjectId],
            default: [],
            ref: 'voting_project',
        },
        password: {
            type: String,
            minlength: 8,
            maxlength: 1024,
            required: true,
        },
        isAdmin: { type: Boolean, default: false },
    },
    {
        versionKey: false,
        toJSON: {
            transform: function (_doc, ret) {
                delete ret.password;
                delete ret.__v;
            },
        },
    }
);
// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// Generate auth token method
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            isAdmin: this.isAdmin,
        },

        getJWTSecret(),
        { expiresIn: '7d', algorithm: 'HS256' }
    );
    return token;
};

// User model
const UserModel: Model<User> = mongoose.model('voting_user', userSchema);

function validateSchema(user: Partial<User>) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().label('Name'),
        email: Joi.string()
            .min(5)
            .max(255)
            .email()
            .required()
            .label('Email')
            .lowercase(),
        password: Joi.string().min(8).max(1024).required().label('Password'),
    });
    const { error } = schema.validate({
        name: user.name,
        email: user.email,
        password: user.password,
    });
    return { error };
}
function validateAuth(req: { user: { email: string; password: string } }) {
    const schema = Joi.object({
        email: Joi.string().email().required().max(255).label('Email'),
        password: Joi.string().min(5).max(255).required().label('Password'),
    });

    const { error } = schema.validate({
        email: req.user.email,
        password: req.user.password,
    });

    return { error };
}

export { UserModel as User, validateSchema, validateAuth, userSchema };
