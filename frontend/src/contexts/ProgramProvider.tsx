import { createContext, useContext, useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { IDL } from "../program/cli/idl";



// Define the type for your program's IDL
type ProgramType = Program<typeof IDL>;

// Create the context
const ProgramContext = createContext<{
    program: ProgramType | null;
    error: Error | null;
}>({
    program: null,
    error: null,
});


export function ProgramProvider({ children }: { children: React.ReactNode }) {
    const { connection } = useConnection();
    const wallet = useWallet();

    const { program, error } = useMemo(() => {
        try {
            if (!wallet.publicKey) {
                return { program: null, error: null };
            }

            const provider = new AnchorProvider(connection, wallet as any, {
                commitment: "confirmed",
            });

            const program = new Program(IDL, provider);
            return { program, error: null };
        } catch (error) {
            console.log(error);
            return { program: null, error: error as Error };
        }
    }, [connection, wallet]);

    if (error) {
        return (
            <div>
                <h1>Error initializing program</h1>
            </div>
        );
    }

    return (
        <ProgramContext.Provider value={{ program, error }}>
            {children}
        </ProgramContext.Provider>
    );
}

// Custom hook to use the program context
export function useProgram() {
    const context = useContext(ProgramContext);
    if (context === undefined) {
        throw new Error("useProgram must be used within a ProgramProvider");
    }
    return context;
}