import { CurrencyAmount, Token } from '..'
import { SupportedToken } from '../entities/supportedToken'
import { Vault } from '..'
import { Direction } from '..'
import JSBI from 'jsbi'

describe('direction', () => {
  const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
  const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
  const DAI2 = new Token(2, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
  const WETH = new Token(1, '0xF3628b72eDF011535664FfBA6E074194c2E47276', 18, 'WETH', 'Wrapped ETH')

  const stUSDC = new SupportedToken(
    USDC,
    CurrencyAmount.fromRawAmount(USDC, '20'),
    CurrencyAmount.fromRawAmount(USDC, '30'),
    CurrencyAmount.fromRawAmount(USDC, '100')
  )

  const stDAI = new SupportedToken(
    DAI,
    CurrencyAmount.fromRawAmount(DAI, '20'),
    CurrencyAmount.fromRawAmount(DAI, '30'),
    CurrencyAmount.fromRawAmount(DAI, '100')
  )
  const stDAI2 = new SupportedToken(
    DAI2,
    CurrencyAmount.fromRawAmount(DAI, '20'),
    CurrencyAmount.fromRawAmount(DAI, '30'),
    CurrencyAmount.fromRawAmount(DAI, '100')
  )

  const supportedTokensFrom = {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': stUSDC,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI
  }
  const supportedTokensTo = { '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI2 }
  const vaultFrom = new Vault(
    1,
    false,
    JSBI.BigInt('10'),
    JSBI.BigInt('100'),
    JSBI.BigInt('20'),
    JSBI.BigInt('40'),
    JSBI.BigInt('50'),
    supportedTokensFrom
  )

  const vaultTo = new Vault(
    2,
    false,
    JSBI.BigInt('100'),
    JSBI.BigInt('500'),
    JSBI.BigInt('200'),
    JSBI.BigInt('400'),
    JSBI.BigInt('500'),
    supportedTokensTo
  )

  it('Invalid from and to tokens', () => {
    //const direction1 =
    expect(() => new Direction({ vault: vaultFrom, token: WETH }, { vault: vaultTo, token: DAI2 })).toThrow(
      'FROM_TOKEN_NOT_FOUND'
    )
    expect(() => new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: WETH })).toThrow(
      'TO_TOKEN_NOT_FOUND'
    )
  })
  it('Invalild fromToken chainId', () => {
    expect(() => new Direction({ vault: vaultFrom, token: DAI2 }, { vault: vaultTo, token: DAI2 })).toThrow(
      'FROM_TOKEN_CHAIN_ID'
    )
    expect(() => new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: DAI })).toThrow(
      'TO_TOKEN_CHAIN_ID'
    )
  })
  it('Valid Destination', () => {
    const direction: Direction = new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: DAI2 })
    expect(direction.supportedSourceToken).toEqual(stDAI)
    expect(direction.supportedDestinationToken).toEqual(stDAI2)
  })
})
