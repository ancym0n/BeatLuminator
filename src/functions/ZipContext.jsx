import React, { createContext, useState, useContext } from "react";

const ZipContext = createContext();

export const ZipProvider = ({ children }) => {
  const [globalZip, setGlobalZip] = useState(null);
  return (
    <ZipContext.Provider value={{ globalZip, setGlobalZip }}>
      {children}
    </ZipContext.Provider>
  );
};

export const useZip = () => useContext(ZipContext);
