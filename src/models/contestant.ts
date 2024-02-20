import Joi from 'joi';
import mongoose, { Schema, Model, Types } from 'mongoose';

interface Contestant {
    _id: Types.ObjectId;
    name: string;
    categories: string[];
    countedVotes: number;
    projectId: Types.ObjectId;
    isDeleted: boolean;
}

// Project schema
const contestantSchema = new Schema<Contestant>({
    name: { type: String, required: true },
    categories: [String],
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
        categories: Joi.array(),
    });

    const { error } = schema.validate({
        name: contestant.name,
        categories: contestant.categories,
    });

    return error;
}

export { Contestant, validateSchema };
