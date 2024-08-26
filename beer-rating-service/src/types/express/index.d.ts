import { IUser } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Specify the type of req.user as IUser
    }
  }
}
