import Joi from 'joi';
import mongoose, { Schema, Model, Types } from 'mongoose';

interface Project {
    _id: Types.ObjectId;
    name: string;
    owner: Types.ObjectId;
    categories: {
        option1: CatergorieOption;
        option2: CatergorieOption;
        title: string;
    }[];
    config: {
        useTime: boolean;
        votingStartDayAndTime: Date;
        votingEndDayAndTime: Date;
        votingEnabled: boolean;
        limitVotesToOnePerIp: boolean;
    };
    isDeleted: boolean;
}
interface CatergorieOption {
    key: string;
    name: string;
    color: 'pink' | 'blue' | 'white';
}

// Project schema
const projectSchema = new Schema<Project>({
    name: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'voting_user', required: true },
    categories: { key1: String, key2: String, title: String },
    config: {
        useTime: { type: Boolean, default: false },
        votingStartDayAndTime: { type: Date, default: Date.now() },
        votingEndDayAndTime: { type: Date, default: Date.now() },
        limitVotesToOnePerIp: Boolean,
        votingEnabled: { type: Boolean, default: false },
    },
    isDeleted: Boolean,
});

// Project Model
const Project: Model<Project> = mongoose.model('voting_project', projectSchema);

function validateSchema(project: Partial<Project>) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().label('Name'),
        limitVotesToOnePerIp: Joi.boolean().required(),
        config: {
            useTime: Joi.boolean(),
            votingStartDayAndTime: Joi.date(),
            votingEndDayAndTime: Joi.date(),
            limitVotesToOnePerIp: Joi.boolean(),
            votingEnabled: Joi.boolean(),
        },
        categories: Joi.array(),
    });

    const { error } = schema.validate({
        name: project.name,
        limitVotesToOnePerIp: project.config.limitVotesToOnePerIp,
        config: project.config,
        categories: project.categories,
    });

    return error;
}

export { Project, validateSchema };
