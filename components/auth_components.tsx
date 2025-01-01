import { signIn, signOut } from "@/auth";
import { Button } from "./ui/button";

export function SignIn({provider, ...props}:{provider?: string} & React.ComponentPropsWithRef<typeof Button>){
    return (
        <form
            action={async() => {
                "use server"
                await signIn(provider);
            }}>
                <Button {...props} >Sign In</Button>
        </form>
    )
}