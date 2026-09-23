import type {
  LoginResponse,
  RefreshResponse,
} from "./Auth";

export interface AuthRepository {
  login(
    email: string,
    password: string
  ): Promise<LoginResponse>;

  refresh(
    refreshToken: string
  ): Promise<RefreshResponse>;

  logout(
    accessToken: string,
    refreshToken: string
  ): Promise<void>;
}
