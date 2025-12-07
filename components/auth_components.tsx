import { signIn, signOut } from "@/auth";
import { Button } from "./ui/button";
import React from "react";
import Link from "next/link";

export function SignIn({provider, ...props}:{provider?: string} & React.ComponentPropsWithRef<typeof Button>){
    if (provider) {
        return (
            <form
                action={async() => {
                    "use server"
                    await signIn(provider, { redirectTo: "/dashboard"});
                }}>
                    <Button {...props} >Sign In with {provider}</Button>
            </form>
        )
    }
    return (
        <Button asChild {...props}>
            <Link href="/auth/signin">Sign In</Link>
        </Button>
    )
}

export function SignOut({ ...props} : React.ComponentPropsWithRef<typeof Button>){
    return (
        <form
            action={async () => {
                "use server"
                await signOut({redirectTo: "/"} );
            }}>
                <Button {...props} >Sign Out</Button>
            </form>
    )
}