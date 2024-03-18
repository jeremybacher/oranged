import React, { ReactNode } from "react";

interface SnackContextProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

const SnackContext = React.createContext<SnackContextProps>(
  {} as SnackContextProps
);

const SnackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = React.useState<string>("");

  return (
    <SnackContext.Provider value={{ message, setMessage }}>
      {children}
    </SnackContext.Provider>
  );
};

export { SnackContext, SnackProvider };
