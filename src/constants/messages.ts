export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  GONE: 410,
  TOO_MANY_REQUEST: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const MESSAGE = {
  ERROR: {
    EMAIL_NOT_FOUND: "Email doesn't exists!",
    WRONG_PASSWORD: "Password is incorrect!",
    INVALID_INPUT: "Invalid input provided!",
    JWT_NOT_DEFINED: "JWT_SECRET is not defined!",
    SERVER_ERROR: "Internal server error!",
    ACCESS_DENIED: "Access denied, no token provided!",
    INVALID_TOKEN: "Invalid token provided!",
    NOT_FOUND: "not found!",
    NO_TEAMS_WEBHOOK: "There is no webhook for microsoft teams supported!",
  },
  SUCCESS: {
    LOGGED_IN: "Logged-in successfully!",
  },
};
