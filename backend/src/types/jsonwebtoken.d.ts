declare module 'jsonwebtoken' {
    export interface JwtPayload {
        [key: string]: unknown
    }
    export function sign(
        payload: string | object | Buffer,
        secretOrPrivateKey: jwt.Secret,
        options?: jwt.SignOptions
    ): string
    export function verify(
        token: string,
        secretOrPublicKey: jwt.Secret
    ): JwtPayload | string
}
