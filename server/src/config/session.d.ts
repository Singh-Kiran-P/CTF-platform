declare module Express {
    namespace Request {
        export interface session {
            isCaptain: boolean;
        }
    }
}
// TODO: what is this