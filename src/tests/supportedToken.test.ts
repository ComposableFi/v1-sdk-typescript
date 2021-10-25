import { CurrencyAmount, Token } from '..'
import { SupportedToken } from '../entities/supportedToken'

describe('Supported Token', () => {
  const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
  const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
  it('Invalid min max deposit', () => {
    expect(
      () =>
        new SupportedToken(
          USDC,
          CurrencyAmount.fromRawAmount(DAI, '30'),
          CurrencyAmount.fromRawAmount(DAI, '20'),
          CurrencyAmount.fromRawAmount(DAI, '100')
        )
    ).toThrow('MIN_MAX_DEPOSIT_RELATIONSHIP')
  })
  it('Invalid available liquidity', () => {
    expect(
      () =>
        new SupportedToken(
          USDC,
          CurrencyAmount.fromRawAmount(DAI, '20'),
          CurrencyAmount.fromRawAmount(DAI, '30'),
          CurrencyAmount.fromRawAmount(DAI, '-100')
        )
    ).toThrow('AVAILABLE_LIQUIDITY_NEGATIVE')
  })
  it('Valid deposit', () => {
    const st: SupportedToken<Token> = new SupportedToken(
      USDC,
      CurrencyAmount.fromRawAmount(DAI, '20'),
      CurrencyAmount.fromRawAmount(DAI, '30'),
      CurrencyAmount.fromRawAmount(DAI, '100')
    )
    expect(st.minDeposit).toEqual(CurrencyAmount.fromRawAmount(DAI, '20'))
    expect(st.maxDeposit).toEqual(CurrencyAmount.fromRawAmount(DAI, '30'))
    expect(st.availableLiquidity).toEqual(CurrencyAmount.fromRawAmount(DAI, '100'))
  })
  it('Invalid updateAvailableLiquidity', () => {
    const st: SupportedToken<Token> = new SupportedToken(
      USDC,
      CurrencyAmount.fromRawAmount(DAI, '20'),
      CurrencyAmount.fromRawAmount(DAI, '30'),
      CurrencyAmount.fromRawAmount(DAI, '100')
    )
    expect(() => st.updateAvailableLiquidity(CurrencyAmount.fromRawAmount(DAI, '-100'))).toThrow(
      'AVAILABLE_LIQUIDITY_NEGATIVE'
    )
  })
  it('Valid updateAvailableLiquidity', () => {
    const st: SupportedToken<Token> = new SupportedToken(
      USDC,
      CurrencyAmount.fromRawAmount(DAI, '20'),
      CurrencyAmount.fromRawAmount(DAI, '30'),
      CurrencyAmount.fromRawAmount(DAI, '100')
    )
    st.updateAvailableLiquidity(CurrencyAmount.fromRawAmount(DAI, '200'))
    expect(st.availableLiquidity).toEqual(CurrencyAmount.fromRawAmount(DAI, '200'))
  })
})
