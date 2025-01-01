import NextAuth from "next-auth";
import Github from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth} = NextAuth({
    providers: [Github],
})