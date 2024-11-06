import React from 'react'


import { db } from "@/lib/db";

import { currentUser } from "@/lib/auth";

const pageQr = async () => {

  const session = await currentUser();
  
  const user = await db.user.findUnique({
  where: {email: session?.email ?? ""}
  });
  
  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <>
    
    </>
  )
}

export default pageQr
