export interface JwtRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}