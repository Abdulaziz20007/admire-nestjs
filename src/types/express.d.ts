declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user attached by auth guard/middleware.
       */
      user?: {
        id: number;
        // add additional fields here if needed
        [key: string]: any;
      };
    }
  }
}

export {};
