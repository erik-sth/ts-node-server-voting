import { Schema, model, Document, Types } from 'mongoose';

interface Vote extends Document {
    _id: Types.ObjectId;
    contestandId: Types.ObjectId;
    projectId: Types.ObjectId;
    publicIpAddress: string;
    remotePort: string;
    gender: 'm' | 'F';
}

const voteSchema = new Schema<Vote>({
    contestandId: { type: Schema.Types.ObjectId, ref: 'voting_contestant' },
    projectId: { type: Schema.Types.ObjectId, ref: 'voting_project' },
    publicIpAddress: { type: String },
    remotePort: { type: String },
    gender: String,
});

const VoteModel = model<Vote>('voting_vote', voteSchema);

export { VoteModel as Vote };
