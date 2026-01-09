import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    agents: Array<{
      id: string;
      name: string;
      bolnaAgentId: string;
      description?: string;
      color?: string;
    }>;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      agents: Array<{
        id: string;
        name: string;
        bolnaAgentId: string;
        description?: string;
        color?: string;
      }>;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    agents: Array<{
      id: string;
      name: string;
      bolnaAgentId: string;
      description?: string;
      color?: string;
    }>;
  }
}
