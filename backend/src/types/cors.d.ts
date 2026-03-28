// Local declaration for the 'cors' package to satisfy TypeScript when @types/cors
// is not installed. This provides a minimal typed signature using Express'
// RequestHandler so imports like `import cors from 'cors'` type-check.
import { RequestHandler } from 'express';

declare module 'cors' {
  function cors(options?: any): RequestHandler;
  namespace cors {}
  export default cors;
}
