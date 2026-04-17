import React, { ReactNode, useCallback } from "react";
import { toast } from "sonner";

interface SnackContextProps {
  message: string;
  setMessage: (msg: string) => void;
}

const SnackContext = React.createContext<SnackContextProps>(
  {} as SnackContextProps
);

const SnackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessageState] = React.useState<string>("");

  const setMessage = useCallback((msg: string) => {
    if (msg) {
      toast.error(msg);
    }
    setMessageState(msg);
  }, []);

  return (
    <SnackContext.Provider value={{ message, setMessage }}>
      {children}
    </SnackContext.Provider>
  );
};

export { SnackContext, SnackProvider };
