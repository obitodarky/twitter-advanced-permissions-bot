import {
    Implementation,
    MetaMaskSmartAccount,
    toMetaMaskSmartAccount,
  } from "@metamask/smart-accounts-kit";
  import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
  import type { PublicClient } from "viem";
  
  export interface CreateSessionAccountParams {
    publicClient: PublicClient;
    implementation?: Implementation;
    deploySalt?: `0x${string}`;
  }
  
  export interface CreateSessionAccountResult {
    sessionAccount: MetaMaskSmartAccount;
    privateKey: `0x${string}`;
  }
  
  /**
   * Creates a new session account (smart account) for ERC-7715 permissions
   * 
   * @param params - Configuration for creating the session account
   * @returns The created session account and its private key
   * @throws {Error} If public client is not provided
   */
  export async function createSessionAccount(
    params: CreateSessionAccountParams
  ): Promise<CreateSessionAccountResult> {
    const {
      publicClient,
      implementation = Implementation.Hybrid,
      deploySalt = "0x",
    } = params;
  
    if (!publicClient) {
      throw new Error("Public client is required");
    }
  
    // Generate a random private key for the session account
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
  
    // Create a MetaMask smart account
    const sessionAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation,
      deployParams: [account.address, [], [], []],
      deploySalt,
      signer: { account },
    });
  
    return {
      sessionAccount,
      privateKey,
    };
  }
  
  /**
   * Gets default session account configuration
   */
  export function getDefaultSessionAccountConfig() {
    return {
      implementation: Implementation.Hybrid,
      deploySalt: "0x" as const,
    };
  }