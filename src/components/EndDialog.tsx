import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EndDialogProps {
  showDialog: boolean;
  score: number;
  bestScore: number;
}

const EndDialog: React.FC<EndDialogProps> = ({
  showDialog,
  score,
  bestScore,
}) => {
  const [isOpen, setIsOpen] = useState(showDialog);

  useEffect(() => {
    setIsOpen(showDialog);
  }, [showDialog]);

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Game Over</AlertDialogTitle>
          <AlertDialogDescription>
            Score: {score} &nbsp; Best: {bestScore}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleRestart}>Restart</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EndDialog;
