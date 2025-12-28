import { connectAndSetupSessionAccount } from "@/services/connectService"
import { wagmiConfig } from "@/services/wagmiConfig"
import { handleGrantPermissions } from "@/services/permissionService"
import type { MetaMaskSmartAccount } from "@metamask/smart-accounts-kit"
import type { WalletClient } from "viem";


export async function handleSpin(){
	await handleConnect();
}

async function handleConnect (): Promise<void> {
	try {
	  const result = await connectAndSetupSessionAccount({
	    config: wagmiConfig,
	  })

	  console.log("EOA:", result.address)
	  console.log("Chain:", result.chainId)
	  console.log("Session Account:", result.sessionAccount)
	  
	  if(result.sessionAccount){
	  	await grantPermission({
		  sessionAccount: result.sessionAccount,
		  walletClient: result.walletClient,
		  chainId: result.chainId,
		})
	  }

	} catch (e) {
	  console.error(e)
	}
}

async function grantPermission ( params: {
  sessionAccount: MetaMaskSmartAccount
  walletClient: WalletClient
  chainId: number	
} ) {

	const { sessionAccount, walletClient, chainId } = params;

	await handleGrantPermissions({
		sessionAccount,
		walletClient: walletClient,
		chainId,
		isAdjustmentAllowed: true
	});
}