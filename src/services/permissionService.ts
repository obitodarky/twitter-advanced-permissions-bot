import { parseEther, PublicClient, WalletClient } from "viem";
import { erc7715ProviderActions, type RequestExecutionPermissionsReturnType } from "@metamask/smart-accounts-kit/actions";
import type { MetaMaskSmartAccount } from "@metamask/smart-accounts-kit"

export type Permission = NonNullable<RequestExecutionPermissionsReturnType>[number];


export async function handleGrantPermissions(params: {
  sessionAccount: MetaMaskSmartAccount
  walletClient: WalletClient
  chainId: number
  isAdjustmentAllowed: boolean
}) : Promise<void> {

  const { sessionAccount, walletClient, chainId, isAdjustmentAllowed } = params

  try {
    const client = walletClient.extend(erc7715ProviderActions());
    const currentTime = Math.floor(Date.now() / 1000);
    // 30 days in seconds
    const expiry = currentTime + 24 * 60 * 60 * 30;

    const permissions = await client.requestExecutionPermissions([{
      chainId,
      expiry,
      signer: {
        type: "account",
        data: {
          address: sessionAccount.address,
        },
      },
      isAdjustmentAllowed,
      permission: {
        type: "native-token-periodic",
        data: {
          // 0.001 ETH in WEI format.
          periodAmount: parseEther("0.001"),
          // 1 day in seconds
          periodDuration: 86400,
          justification: "Permission to transfer 0.001 ETH every day",
        },
      },
    }]);
    
  } catch (error) {
    console.error('Error granting permissions:', error);
  }
}