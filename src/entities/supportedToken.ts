import invariant from 'tiny-invariant'
import { CurrencyAmount } from '../core/main/fractions/currencyAmount'
import { Token } from '../core/main/token'

/**
 * Represents a supported token of the vault on a specific network. Stores available
 * liquidity, mininum and maximum deposit amount as well to support further calculations.
 *
 * @template TInput The input token, current only ERC-20 tokens are supported
 */
export class SupportedToken<TInput extends Token> {
  /**
   * The underlying supported ERC-20 token
   */
  public readonly token: TInput

  /**
   * Minimum required token deposit amount
   */
  public readonly minDeposit: CurrencyAmount<TInput>

  /**
   * Maximum required token deposit amount
   */
  public readonly maxDeposit: CurrencyAmount<TInput>

  /**
   * Currently available token liquidity in the vault
   */
  private _availableLiquidity: CurrencyAmount<TInput>

  /**
   * Construct a supported token by passing in the pre-computed property values
   * @param token The underlying supported ERC-20 token
   * @param minDeposit Minimum required token deposit amount
   * @param maxDeposit  Maximum required token deposit amount
   * @param availableLiquidity Currently available token liquidity in the vault
   */
  public constructor(
    token: TInput,
    minDeposit: CurrencyAmount<TInput>,
    maxDeposit: CurrencyAmount<TInput>,
    availableLiquidity: CurrencyAmount<TInput>
  ) {
    this.token = token

    invariant(minDeposit.greaterThanOrEqual(0) && minDeposit.lessThan(maxDeposit), 'MIN_MAX_DEPOSIT_RELATIONSHIP')

    invariant(availableLiquidity.greaterThanOrEqual(0), 'AVAILABLE_LIQUIDITY_NEGATIVE')

    this.minDeposit = minDeposit
    this.maxDeposit = maxDeposit
    this._availableLiquidity = availableLiquidity
  }

  public updateAvailableLiquidity(availableLiquidity: CurrencyAmount<TInput>) {
    invariant(availableLiquidity.greaterThanOrEqual(0), 'AVAILABLE_LIQUIDITY_NEGATIVE')
    this._availableLiquidity = availableLiquidity
  }

  public get availableLiquidity() {
    return this._availableLiquidity
  }
}
