import {Account} from '../database';

declare global {
    namespace Express {
        export interface Request {
            //user: Account;
            lol: string;
        }
        export interface Response {
            user: Account;
        }
    }
}
