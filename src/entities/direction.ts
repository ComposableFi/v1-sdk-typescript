import invariant from 'tiny-invariant'
import { Token } from '../core/main/token'
import { Vault } from './vault'
/**
 * Represents a vault contract on a specific network. Stores available
 * immutable properties to support further calculations.
 */
export class Direction {
  /**
   * Specifies source vault and source token
   */
  public readonly from: { vault: Vault; token: Token }

  /**
   * Specifies destination vault and destination token
   */
  public readonly to: { vault: Vault; token: Token }

  /**
   * Construct a direction by passing in the pre-computed property values
   * @param from specifies source vault and source token
   * @param to specifies destination vault and destination token
   */
  public constructor(from: { vault: Vault; token: Token }, to: { vault: Vault; token: Token }) {
    invariant(from.token.address in from.vault.supportedTokens, 'FROM_TOKEN_NOT_FOUND')
    invariant(to.token.address in to.vault.supportedTokens, 'TO_TOKEN_NOT_FOUND')

    invariant(
      from.vault.supportedTokens[from.token.address].token.chainId === from.token.chainId,
      'FROM_TOKEN_CHAIN_ID'
    )
    invariant(to.vault.supportedTokens[to.token.address].token.chainId === to.token.chainId, 'TO_TOKEN_CHAIN_ID')

    this.from = from
    this.to = to
  }

  public get supportedSourceToken() {
    return this.from.vault.supportedTokens[this.from.token.address]
  }

  public get supportedDestinationToken() {
    return this.to.vault.supportedTokens[this.to.token.address]
  }
}
