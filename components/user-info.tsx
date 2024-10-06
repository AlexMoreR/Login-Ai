import { ExtendedUser } from "@/next-auth";
import { User } from "next-auth";

interface UserInfoProps {
    user: User;
    label: string,
}

export const UserInfo = ({
    user,
    label,
}: UserInfoProps) => {
    return (
        <div>{user?.name}</div>
    )
}