import { signIn, signOut } from "@/auth";
import { Button } from "./ui/button";
import React from "react";

export function SignIn({provider, ...props}:{provider?: string} & React.ComponentPropsWithRef<typeof Button>){
    return (
        <form
            action={async() => {
                "use server"
                await signIn(provider, { redirectTo: "/dashboard"});
            }}>
                <Button {...props} >Sign In</Button>
        </form>
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