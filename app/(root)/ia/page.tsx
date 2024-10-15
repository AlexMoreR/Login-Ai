import OpenAICredentialManager from '@/components/form-credia'
import React from 'react'
import { db } from "@/lib/db";


import { currentUser } from "@/lib/auth";

export default async function(){

  const session = await currentUser();

  const user = await db.user.findUnique({
    where: {email: session?.email ?? ""}
  });

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <>
      <OpenAICredentialManager userId={user.id} />
    </>
  )
}
