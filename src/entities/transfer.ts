import invariant from 'tiny-invariant'
import { Currency } from '../core/main/currency'
import { CurrencyAmount } from '../core/main/fractions/currencyAmount'
import { Direction } from './direction'

import JSBI from 'jsbi'
import { validateAndParseAddress } from '../core/utils/validateAndParseAddress'
import { Token } from '..'
import Big from 'big.js'

/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
export class Transfer<TInput extends Currency> {
  public readonly direction: Direction
  public readonly amount: CurrencyAmount<TInput>
  public readonly destinationAddress: string
  public readonly transferDelay: number

  public constructor(
    direction: Direction,
    amount: CurrencyAmount<TInput>,
    destinationAddress: string,
    transferDelay: number
  ) {
    this.destinationAddress = validateAndParseAddress(destinationAddress)
    this.transferDelay = transferDelay
    this.amount = amount
    this.direction = direction
  }

  public verifyTransfer = () => {
    const fromToken = this.direction.supportedSourceToken
    const toToken = this.direction.supportedDestinationToken

    invariant(
      this.amount.greaterThanOrEqual(fromToken.minDeposit) && this.amount.lessThanOrEqual(fromToken.maxDeposit),
      'AMOUNT_THRESHOLD'
    )

    invariant(this.amount.lessThanOrEqual(toToken.availableLiquidity), 'LIQUIDITY')

    invariant(
      JSBI.greaterThanOrEqual(
        JSBI.BigInt(this.transferDelay),
        JSBI.BigInt(this.direction.from.vault.minTransferDelay)
      ) &&
        JSBI.lessThanOrEqual(JSBI.BigInt(this.transferDelay), JSBI.BigInt(this.direction.from.vault.maxTransferDelay)),
      'DEPOSIT_TIME_THRESHOLD'
    )

    return this
  }

  public calculateFee = (): CurrencyAmount<Token> => {
    const toVault = this.direction.to.vault
    const toToken = this.direction.to.token
    const liquidity = toVault.supportedTokens[toToken.address].availableLiquidity

    const maxFeePercentage = toVault.maxFee
    const minFeePercentage = toVault.minFee
    const feeThreshold = toVault.feeThreshold

    if (
      liquidity.equalTo(0) ||
      this.amount
        .multiply(100)
        .divide(liquidity)
        .greaterThan(feeThreshold)
    ) {
      const feeBig = new Big(this.amount.toSignificant(toToken.decimals)).mul(
        new Big(maxFeePercentage.toString()).div(10000)
      )
      return CurrencyAmount.fromRawAmount(toToken, feeBig.mul(new Big(10).pow(toToken.decimals)).toFixed(0))
    }

    const maxTransfer = liquidity.multiply(feeThreshold).divide(100)
    const hun = this.amount.multiply(100).divide(maxTransfer)
    const percentTransfer = new Big(hun.toSignificant(toToken.decimals))
    const perc = percentTransfer
      .mul(new Big(maxFeePercentage.toString()).minus(minFeePercentage.toString()))
      .add(new Big(minFeePercentage.toString()))
      .div(10000)

    const feeBig = new Big(this.amount.toSignificant(toToken.decimals)).mul(perc)
    const fee = CurrencyAmount.fromRawAmount(toToken, feeBig.mul(new Big(10).pow(toToken.decimals)).toFixed(0))
    return fee
  }
}
