import React, { createContext, useContext, useEffect, useState } from 'react';
import { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

interface WalletContextType {
  accountId: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connector, setConnector] = useState<DAppConnector | null>(null);

  useEffect(() => {
    const initConnector = async () => {
      try {
        const dAppConnector = new DAppConnector(
          {
            name: "TRITON",
            description: "Trustless Water Compliance",
            url: window.location.origin,
            icons: [window.location.origin + "/placeholder.svg"]
          },
          LedgerId.TESTNET,
          "6ef1bda914f4ea32a5b3f820bc8940c1"
        );

        await dAppConnector.init();
        setConnector(dAppConnector);

        if (dAppConnector.signers && dAppConnector.signers.length > 0) {
            setAccountId(dAppConnector.signers[0].getAccountId().toString());
        }
      } catch (err) {
        console.error("Hedera DAppConnector init failed", err);
      }
    };
    initConnector();
  }, []);

  const connect = async () => {
    if (!connector) return;
    setIsConnecting(true);
    try {
      await connector.openModal();
      if (connector.signers && connector.signers.length > 0) {
        setAccountId(connector.signers[0].getAccountId().toString());
      }
    } catch (error) {
       console.error("Failed to connect wallet", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!connector) return;
    try {
      await connector.disconnectAll();
      setAccountId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WalletContext.Provider value={{ accountId, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
};
