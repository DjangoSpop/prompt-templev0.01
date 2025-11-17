/**
 * Try Me Button - Triggers the Try Me chat modal
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { TryMeChatModal } from "./TryMeChatModal";

interface TryMeButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  initialPrompt?: string;
  className?: string;
}

export const TryMeButton: React.FC<TryMeButtonProps> = ({
  variant = "default",
  size = "default",
  initialPrompt,
  className = "",
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setModalOpen(true)}
        className={className}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Try Me
      </Button>

      <TryMeChatModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialPrompt={initialPrompt}
      />
    </>
  );
};
