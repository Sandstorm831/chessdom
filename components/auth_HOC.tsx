"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function isAuth(Component: any) {
  return function IsAuth(props: any) {
    const { data: session, status } = useSession();
    useEffect(() => {
      console.log(status);
      if (status !== "authenticated") {
        return redirect("/");
      }
    }, []);

    if (status !== "authenticated") {
      return null;
    }
    return <Component {...props} />;
  };
}
