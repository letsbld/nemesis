'use client';

import * as React from 'react';
import {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    width?: string;
}

const SideDrawer: React.FC<SideDrawerProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    width = '30%',
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-auto" style={{ width }}>
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="p-4">{children}</div>
                <SheetFooter>
                    <button onClick={onClose}>Close</button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default SideDrawer;
