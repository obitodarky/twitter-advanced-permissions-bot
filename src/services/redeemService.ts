import { Hex, type PublicClient, encodeFunctionData, erc20Abi } from "viem";
import type { MetaMaskSmartAccount } from "@metamask/smart-accounts-kit";
import type { Permission } from "@/providers/PermissionProvider";
import { pimlicoClientFactory } from "@/services/pimlicoClient";
import { bundlerClientFactory } from "@/services/bundlerClient";

export interface RedeemPermissionParams {
  permission: Permission;
  sessionAccount: MetaMaskSmartAccount;
  publicClient: PublicClient;
  chainId: number;
  calls?: Array<{
    to: Hex;
    data: Hex;
    value: bigint;
  }>;
  // Optional: For ERC-20 token permissions, specify token address and recipient
  tokenAddress?: Hex;
  tokenRecipient?: Hex;
  tokenAmount?: bigint;
}

export interface RedeemPermissionResult {
  userOperationHash: Hex;
  transactionHash: Hex;
  receipt: any;
}

/**
 * Redeems a permission by sending a user operation with delegation
 * 
 * @param params - Configuration for redeeming the permission
 * @returns The user operation hash, transaction hash, and receipt
 * @throws {Error} If required parameters are missing
 */
export async function redeemPermission(
  params: RedeemPermissionParams
): Promise<RedeemPermissionResult> {
  const {
    permission,
    sessionAccount,
    publicClient,
    chainId,
    calls,
    tokenAddress,
    tokenRecipient,
    tokenAmount,
  } = params;

  // Validate permission structure
  const { context, signerMeta } = permission;

  if (!signerMeta) {
    throw new Error("No signer meta found in permission");
  }

  const { delegationManager } = signerMeta;

  if (!context || !delegationManager) {
    throw new Error("Missing required parameters for delegation");
  }

  // Initialize clients
  const pimlicoClient = pimlicoClientFactory(chainId);
  const bundlerClient = bundlerClientFactory(chainId);

  // Get gas price estimates
  const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

  // Default call if none provided
  const defaultCalls = calls || (() => {
    // If token address is provided, create ERC-20 transfer call
    if (tokenAddress && tokenRecipient && tokenAmount) {
      return [
        createERC20TransferCall(
          tokenAddress,
          tokenRecipient,
          tokenAmount
        ),
      ];
    }
    
    // Try to detect ERC-20 permission from permission object
    // Check if permission has tokenAddress in its structure
    const permissionAny = permission as any;
    if (permissionAny?.permission?.type === "erc20-token-periodic" || 
        permissionAny?.permission?.data?.tokenAddress) {
      const tokenAddress = permissionAny.permission?.data?.tokenAddress;
      const periodAmount = permissionAny.permission?.data?.periodAmount;
      
      if (tokenAddress && periodAmount) {
        // Use the session account as recipient by default
        return [
          createERC20TransferCall(
            tokenAddress,
            sessionAccount.address,
            BigInt(periodAmount.toString())
          ),
        ];
      }
    }
    
    // Default: native token transfer (1 wei to self)
    return [
      {
        to: sessionAccount.address,
        data: "0x" as Hex,
        value: 1n,
      },
    ];
  })();

  // Send user operation with delegation
  // Map calls to include permissionsContext and delegationManager
  const callsWithDelegation = defaultCalls.map((call) => ({
    ...call,
    permissionsContext: context,
    delegationManager,
  }));

  // Type assertion to resolve bundlerClient type inference issue
  // This is safe as the original component uses the same pattern
  const userOperationHash = await (bundlerClient as any).sendUserOperationWithDelegation({
    publicClient,
    account: sessionAccount,
    calls: callsWithDelegation,
    ...fee,
  });

  // Wait for receipt
  const { receipt } = await bundlerClient.waitForUserOperationReceipt({
    hash: userOperationHash,
  });

  return {
    userOperationHash,
    transactionHash: receipt.transactionHash,
    receipt,
  };
}

/**
 * Creates a simple native token (ETH) transfer call for redeeming permissions
 */
export function createTransferCall(
  to: Hex,
  value: bigint,
  data: Hex = "0x"
): { to: Hex; data: Hex; value: bigint } {
  return {
    to,
    data,
    value,
  };
}

/**
 * Creates an ERC-20 token transfer call
 * @param tokenAddress - The ERC-20 token contract address
 * @param to - The recipient address
 * @param amount - The amount to transfer (in token's smallest unit, e.g., wei for 18 decimals, or smallest unit for 6 decimals like USDC)
 * @returns A call object ready for use in user operations
 */
export function createERC20TransferCall(
  tokenAddress: Hex,
  to: Hex,
  amount: bigint
): { to: Hex; data: Hex; value: bigint } {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, amount],
  });

  return {
    to: tokenAddress,
    data,
    value: 0n, // ERC-20 transfers don't send native tokens
  };
}

/**
 * Determines if a permission is for ERC-20 tokens by checking the permission structure
 * @param permission - The permission object to check
 * @returns true if the permission is for ERC-20 tokens, false otherwise
 */
export function isERC20TokenPermission(permission: Permission): boolean {
  const permissionAny = permission as any;
  
  // Check if permission type is erc20-token-periodic
  if (permissionAny?.permission?.type === "erc20-token-periodic") {
    return true;
  }
  
  // Check if permission data contains tokenAddress (indicates ERC-20)
  if (permissionAny?.permission?.data?.tokenAddress) {
    return true;
  }
  
  return false;
}

/**
 * Extracts token information from an ERC-20 permission
 * @param permission - The permission object
 * @returns Object with tokenAddress and periodAmount, or null if not an ERC-20 permission
 */
export function getERC20TokenInfo(permission: Permission): {
  tokenAddress: Hex;
  periodAmount: bigint;
} | null {
  if (!isERC20TokenPermission(permission)) {
    return null;
  }
  
  const permissionAny = permission as any;
  const tokenAddress = permissionAny?.permission?.data?.tokenAddress;
  const periodAmount = permissionAny?.permission?.data?.periodAmount;
  
  if (!tokenAddress || !periodAmount) {
    return null;
  }
  
  return {
    tokenAddress: tokenAddress as Hex,
    periodAmount: BigInt(periodAmount.toString()),
  };
}