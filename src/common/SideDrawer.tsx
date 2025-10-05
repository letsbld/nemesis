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
                <SheetFooter className="flex gap-4 !justify-center bottom-0 absolute left-0 w-full p-4">
                    <CustomButton
                        btnType="button"
                        style="bg-red-500 text-white hover:bg-red-600"
                        onClick={handleClose}
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        btnType="button"
                        style="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={handleClose}
                    >
                        Save
                    </CustomButton>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default SideDrawer;
