import {
  connect,
  disconnect,
  switchChain,
  getAccount,
  getChainId,
  getConnections,
  getWalletClient,
} from "wagmi/actions"
import type { Config, Connector } from "wagmi"
import type { WalletClient } from "viem"
import { metaMask } from "wagmi/connectors"
import { createSessionAccount } from "./sessionAccountService"
import type { MetaMaskSmartAccount } from "@metamask/smart-accounts-kit"

export interface ConnectionInfo {
  address?: string
  isConnected: boolean
  chainId?: number
  connector?: Connector
}

export interface ConnectParams {
  config: Config
  connector?: Connector
}

export interface ConnectAndSetupResult {
  address: string
  chainId: number
  sessionAccount: MetaMaskSmartAccount
  privateKey: `0x${string}`
  walletClient: WalletClient
}

export async function connectWallet({
  config,
}: ConnectParams) {
  const connector = metaMask();
  return connect(config, { connector })
}

export async function connectAndSetupSessionAccount ({
  config,
}: ConnectParams): Promise<ConnectAndSetupResult> {
  await connectWallet({ config })

  const publicClient = getWalletClient(config)
  if (!publicClient) throw new Error("Public client unavailable")

  const { sessionAccount, privateKey } = await createSessionAccount({
    publicClient,
  })

  const account = getAccount(config)
  const chainId = getChainId(config)

  if (!account.address) throw new Error("Wallet not connected")
  console.log({
    address: account.address,
    chainId,
    sessionAccount,
    privateKey,
    publicClient,
  });
  return {
    address: account.address,
    chainId,
    sessionAccount,
    privateKey,
    publicClient,
  }
}

export async function disconnectWallet(config: Config) {
  await disconnect(config)
}

export async function switchWalletChain(config: Config, chainId: number) {
  await switchChain(config, { chainId })
}

export function getConnectionInfo(config: Config): ConnectionInfo {
  const account = getAccount(config)
  const connections = getConnections(config)

  return {
    address: account.address,
    isConnected: account.isConnected,
    chainId: getChainId(config),
    connector: connections[0]?.connector,
  }
}

export function getWalletClientFromConfig(config: Config) {
  return getWalletClient(config)
}
