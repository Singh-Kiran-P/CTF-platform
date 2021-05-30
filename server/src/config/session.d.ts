declare module Express {
    namespace Request {
        export interface session {
            isCaptain: boolean;
        }
    }
}