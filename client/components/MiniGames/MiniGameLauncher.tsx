import { useState } from "react";
import ColinShots from "./ColinShots";

interface MiniGameLauncherProps {
  gameSlug: string;
  onClose: () => void;
}

export default function MiniGameLauncher({
  gameSlug,
  onClose,
}: MiniGameLauncherProps) {
  const renderGame = () => {
    switch (gameSlug) {
      case "colin-shots":
        return <ColinShots onClose={onClose} />;
      case "joseys-duck-pond":
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-8 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                Josey's Duck Pond Coming Soon! 🦆
              </h2>
              <p className="text-muted-foreground mb-6">
                This exciting duck pond mini game is under development. Check
                back soon for rubber duck fun!
              </p>
              <button
                onClick={onClose}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        );
      case "crack-the-vault":
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-8 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                Crack the Vault Coming Soon! 🔐
              </h2>
              <p className="text-muted-foreground mb-6">
                Test your code-cracking skills in this exciting vault mini game.
                Under development!
              </p>
              <button
                onClick={onClose}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-8 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Game Coming Soon! 🎮</h2>
              <p className="text-muted-foreground mb-6">
                This mini game is currently under development. Check back soon
                for more CoinKrazy fun!
              </p>
              <button
                onClick={onClose}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        );
    }
  };

  return renderGame();
}
