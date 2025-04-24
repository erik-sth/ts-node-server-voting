import { Schema, model, Document, Types } from 'mongoose';

export interface Vote extends Document {
    _id: Types.ObjectId;
    contestantId: Types.ObjectId;
    projectId: Types.ObjectId;
    publicIpAddress: string;
    categories: string[];
    duplicateVote: boolean;
}

const voteSchema = new Schema<Vote>({
    contestantId: { type: Schema.Types.ObjectId, ref: 'voting_contestant' },
    projectId: { type: Schema.Types.ObjectId, ref: 'voting_project' },
    publicIpAddress: { type: String },
    categories: [String],
    duplicateVote: Boolean,
});

const VoteModel = model<Vote>('voting_vote', voteSchema);

export { VoteModel as Vote };
