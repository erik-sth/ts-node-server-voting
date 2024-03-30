import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface UserDocument extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    projects: Types.ObjectId[];
    password: string;
    isAdmin: boolean;
    generateAuthToken(): string;
}

export type UserTokenPayload = Pick<UserDocument, '_id' | 'name' | 'email' | 'isAdmin'>;

export interface AuthenticatedPaginatedRequest extends AuthenticatedRequest {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginateIncomingRequest extends Request {
    page: string | number;
    limit: string | number;
    skip: number;
}

export interface AuthenticatedRequest extends Request {
    user?: UserTokenPayload;
}

export interface LoginRequest extends Request {
    email: string;
    password: string;
}
