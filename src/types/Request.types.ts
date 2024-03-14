import { Request } from 'express';
import { Types } from 'mongoose';
export interface User extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    projects: Types.ObjectId[];
    password: string;
    isAdmin: boolean;
    generateAuthToken(): string;
}
export type UserTokenData = Pick<User, '_id' | 'name' | 'email' | 'isAdmin'>;

export interface PaginateRequest extends AuthenticatedRequest {
    page: number;
    limit: number;
    skip: number;
}
export interface IncomingPaginateRequest extends Request {
    page: string | number;
    limit: string | number;
    skip: number;
}
export interface AuthenticatedRequest extends Request {
    user?: UserTokenData;
}

export interface AuthRequest extends Request {
    email: string;
    password: string;
}
