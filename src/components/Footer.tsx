import React from 'react';
import { Github, Instagram, Twitter } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with ❤️ using React and Socket.IO
        </p>
      </div>
    </footer>
  );
};
