import jwt_decode from "jwt-decode";
import { JwtPayload } from "../types";

const decodeAndReturnUser = (token: string) => {
    const decoded = jwt_decode<JwtPayload>(token);
    return decoded.usuario;
    ;
};

const TokenDecoder = { decodeAndReturnUser };

export default TokenDecoder;