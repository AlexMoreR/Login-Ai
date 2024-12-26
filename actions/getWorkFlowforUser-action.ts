"use server"

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db"   


export async function GetWorkFlowforUser(userId?: string) {

    if(!userId){
        throw new Error("Autenticación.")
    }
    
    return db.workflow.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "asc"
        }
    })
}