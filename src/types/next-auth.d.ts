import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType: "private" | "commercial";
      role: "user" | "moderator" | "admin";
      countryCode: string | null;
      onboardingCompleted: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accountType: string;
    role: string;
    countryCode: string | null;
    onboardingCompleted: boolean;
  }
}
