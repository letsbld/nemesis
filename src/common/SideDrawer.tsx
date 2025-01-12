import * as React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import CustomButton from '@/components/ui/customButton';

interface SideDrawerProps {
    isOpen: boolean;
    handleClose: () => void;
    heading: string;
    description?: string;
    component: React.ReactNode;
    containerWidth?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

const SideDrawer: React.FC<SideDrawerProps> = ({
    isOpen,
    handleClose,
    heading,
    description,
    component,
    containerWidth = '30%',
    side = 'right',
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent side={side} style={{ width: containerWidth }}>
                <SheetHeader>
                    <SheetTitle>{heading}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="p-4">{component}</div>
                <SheetFooter>
                    <CustomButton
                        name="Close"
                        btnType="button"
                        style="bg-red-500 text-white"
                        onClick={handleClose}
                    />
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default SideDrawer;
