"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function isAuth(Component: any) {
  return function IsAuth(props: any) {
    const data = useSession();
    useEffect(() => {
      console.log(data.status);
      if (data.status !== "authenticated") {
        return redirect("/");
      }
    }, [data.status]);

    if (data.status !== "authenticated") {
      return null;
    }
    return <Component {...props} />;
  };
}
