import { createConfig, http } from "wagmi"
import { mainnet, polygon } from "wagmi/chains"
import { metaMask } from "wagmi/connectors"

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
})