import invariant from 'tiny-invariant'
import { BigintIsh } from '../core/constants'
import { Token } from '../core/main/token'
import { SupportedToken } from './supportedToken'
import JSBI from 'jsbi'
/**
 * Represents a vault contract on a specific network. Stores available
 * immutable properties to support further calculations.
 */
export class Vault {
  /**
   * Chain ID of the network where this vault resides
   */
  public readonly chainId: number

  /**
   * Specifies whether contract has paused its execution or not
   */
  public readonly isPaused: boolean

  /**
   * Minimum possible time in seconds that user can specify to wait for their
   * transfer to be successful
   */
  public readonly minTransferDelay: BigintIsh

  /**
   * Maximum possible time in seconds that user can specify to wait for their
   * transfer to be successful
   */
  public readonly maxTransferDelay: BigintIsh

  /**
   * Minimum fee percentage per transfer
   */
  public readonly minFee: BigintIsh

  /**
   * Maximum fee percentage per transfer
   */
  public readonly maxFee: BigintIsh

  /**
   * Used in fee calculation
   */
  public readonly feeThreshold: BigintIsh

  /**
   * Mapping of the erc-20 token addresses and vault data about each token
   */
  public readonly supportedTokens: { [tokenAddress: string]: SupportedToken<Token> }

  /**
   * Construct a vault by passing in the pre-computed property values
   * @param chainId chain ID of the network where this vault resides
   * @param [isPaused=false] specifies if contract has paused its execution or not
   * @param minTransferDelay minimum possible time in seconds that user can specify to wait for their
   * transfer to be successful
   * @param maxTransferDelay maximum possible time in seconds that user can specify to wait for their
   * transfer to be successful
   * @param minFee minimum fee percentage per transfer
   * @param maxFee maximum fee percentage per transfer
   * @param feeThreshold used in fee calculation
   * @param supportedTokens mapping of the erc-20 token addresses and vault data about each token

   */
  public constructor(
    chainId: number,
    isPaused: boolean = false,
    minTransferDelay: BigintIsh,
    maxTransferDelay: BigintIsh,
    minFee: BigintIsh,
    maxFee: BigintIsh,
    feeThreshold: BigintIsh,
    supportedTokens: { [tokenAddress: string]: SupportedToken<Token> }
  ) {
    invariant(Number.isSafeInteger(chainId), 'CHAIN_ID')

    invariant(
      JSBI.greaterThan(JSBI.BigInt(minFee), JSBI.BigInt(0)) &&
        JSBI.greaterThan(JSBI.BigInt(maxFee), JSBI.BigInt(0)) &&
        JSBI.greaterThan(JSBI.BigInt(feeThreshold), JSBI.BigInt(0)),
      'FEE'
    )

    invariant(
      JSBI.greaterThanOrEqual(JSBI.BigInt(minTransferDelay), JSBI.BigInt(0)) &&
        JSBI.greaterThan(JSBI.BigInt(maxTransferDelay), JSBI.BigInt(minTransferDelay)),
      'TRANSFER_THRESHOLD'
    )

    invariant(Object.keys(supportedTokens).length, 'SUPPORTED_TOKENS_LENGTH')

    this.chainId = chainId
    this.isPaused = isPaused
    this.minTransferDelay = minTransferDelay
    this.maxTransferDelay = maxTransferDelay
    this.minFee = minFee
    this.maxFee = maxFee
    this.feeThreshold = feeThreshold
    this.supportedTokens = supportedTokens
  }
}
