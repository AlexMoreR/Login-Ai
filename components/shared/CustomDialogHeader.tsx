"use client"
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils"
import { Separator } from "@radix-ui/react-separator";
import {Icon, LucideIcon} from "lucide-react"


interface Props{
    title?: string;
    subTitle?: string;
    icon?: LucideIcon;

    iconClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;
}

function CustomDialogHeader(props: Props) {
    return(
        <DialogHeader className="py-6">
            <DialogTitle asChild>
                <div className="flex flex-col items-center gap-2 mb-2">
                    {props.icon && (
                        <props.icon
                            size={30}
                            className={cn("stroke-primary", props.iconClassName)}
                        />
                    )}
                    {props.title && (
                            <p className={cn("text-x1 text-primary", props.titleClassName)}>
                                {props.title}
                            </p>
                    )}
                    {props.subTitle && (
                            <p className={cn("text-sm text-primary", props.subtitleClassName)}>
                                {props.subTitle}
                            </p>
                    )}
                </div>
            </DialogTitle>
            <Separator/>
        </DialogHeader>
    )
}

export default CustomDialogHeader;