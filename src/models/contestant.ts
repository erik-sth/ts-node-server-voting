import Joi from 'joi';
import mongoose, { Schema, Model, Types } from 'mongoose';

interface Contestant {
    _id: Types.ObjectId;
    name: string;
    gender: 'm' | 'f';
    countedVotes: number;
    projectId: Types.ObjectId;
    isDeleted: boolean;
}

// Project schema
const contestantSchema = new Schema<Contestant>({
    name: { type: String, required: true },
    gender: String,
    countedVotes: { type: Number, default: 0 },
    projectId: { type: Schema.Types.ObjectId, ref: 'voting_project' },
    isDeleted: { type: Boolean, default: false },
});

// Project Model
const Contestant: Model<Contestant> = mongoose.model(
    'voting_contestant',
    contestantSchema
);

function validateSchema(contestant: Partial<Contestant>) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().label('Name'),
        gender: Joi.valid('m', 'f'),
    });

    const { error } = schema.validate({
        name: contestant.name,
        gender: contestant.gender,
    });

    return error;
}

export { Contestant, validateSchema };
