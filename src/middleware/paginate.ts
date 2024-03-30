import { NextFunction, Response } from 'express';
import { PaginateIncomingRequest } from '../types/Request.types';

export function paginate(
    req: PaginateIncomingRequest,
    _res: Response,
    next: NextFunction
) {
    const { page: pageQuery, limit: limitQuery } = req.query;
    let page: number = 0; // Default page number
    let limit: number = 10; // Default limit

    if (pageQuery) {
        const parsedPage = parseInt(pageQuery as string);
        if (!isNaN(parsedPage) && parsedPage > 0) {
            page = parsedPage - 1; // -1 to start with the first item
        }
    }

    if (limitQuery) {
        const parsedLimit = parseInt(limitQuery as string);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            limit = parsedLimit;
        }
    }

    req.skip = page * limit;
    req.limit = limit;
    next();
}
