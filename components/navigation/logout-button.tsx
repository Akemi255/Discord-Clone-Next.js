"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Profile } from '@prisma/client';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface profileProps {
    profile: Profile
}

const LogoutButton = ({ profile }: profileProps) => {
    const { signOut } = useClerk();
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/sign-in");
            router.refresh();
        } catch (error) {
            console.error("Logout error", error);
        }
    }; signOut

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <img
                            src={profile.imageUrl}
                            width={36}
                            height={36}
                            alt="Avatar"
                            className="overflow-hidden rounded-full"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className='cursor-pointer' onClick={handleSignOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default LogoutButton