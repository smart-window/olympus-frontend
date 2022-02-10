import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider, JsonRpcSigner, StaticJsonRpcProvider } from "@ethersproject/providers";
import { useMemo } from "react";
import { abi as IERC20_ABI } from "src/abi/IERC20.json";
import STAKING_ABI from "src/abi/OlympusStakingv2.json";
import { abi as PAIR_CONTRACT_ABI } from "src/abi/PairContract.json";
import { abi as TENDER_ABI } from "src/abi/Tender.json";
import { abi as WSOHM_ABI } from "src/abi/wsOHM.json";
import { NetworkId } from "src/constants";
import { AddressMap, STAKING_ADDRESSES } from "src/constants/addresses";
import { assert } from "src/helpers";
import { ohm_dai } from "src/helpers/AllBonds";
import { NodeHelper } from "src/helpers/NodeHelper";
import { IERC20, OlympusStakingv2, PairContract, Tender, WsOHM } from "src/typechain";

import { useWeb3Context } from ".";

const provider = NodeHelper.getMainnetStaticProvider();

/**
 * Hook for fetching a contract.
 *
 * @param addressOrMap A contract address, or a map with a contract address for each network
 * @param ABI The contract interface
 * @param provider An optional static provider to be used by the contract
 */
export function useContract<TContract extends Contract = Contract>(
  addressOrMap: AddressMap,
  ABI: ContractInterface,
): TContract | null;
export function useContract<TContract extends Contract = Contract>(
  addressOrMap: string | AddressMap,
  ABI: ContractInterface,
  provider?: StaticJsonRpcProvider | JsonRpcSigner,
): TContract;
export function useContract<TContract extends Contract = Contract>(
  addressOrMap: string | AddressMap,
  ABI: ContractInterface,
  provider?: StaticJsonRpcProvider | JsonRpcSigner,
): TContract | null {
  const { provider: currentProvider, networkId } = useWeb3Context();

  return useMemo(() => {
    const address = typeof addressOrMap === "string" ? addressOrMap : addressOrMap[networkId as NetworkId];
    if (!address) return null;

    try {
      return new Contract(address, ABI, provider || currentProvider) as TContract;
    } catch (error) {
      console.error("Unable to get contract", error);
      return null;
    }
  }, [addressOrMap, ABI, provider, networkId, currentProvider]);
}

const usePairContract = (address: string) => {
  return useContract<PairContract>(address, PAIR_CONTRACT_ABI);
};

export const useStakingContract = () => {
  const address = STAKING_ADDRESSES[NetworkId.MAINNET];

  return useContract<OlympusStakingv2>(address, STAKING_ABI, provider);
};

export const useOhmDaiReserveContract = () => {
  const address = ohm_dai.getAddressForReserve(NetworkId.MAINNET);
  assert(address, "Contract should exist for NetworkId.MAINNET");

  return usePairContract(address);
};

export const useTokenContract = (addressMap: AddressMap, signer?: JsonRpcSigner) => {
  return useContract<IERC20>(addressMap, IERC20_ABI, signer);
};
export const useWrappedContract = (addressMap: AddressMap, provider?: JsonRpcProvider) => {
  return useContract<WsOHM>(addressMap, WSOHM_ABI, provider);
};

export const useTenderEscrowContract = (addressMap: AddressMap, signer?: JsonRpcSigner) => {
  return useContract<Tender>(addressMap, TENDER_ABI, signer);
};
