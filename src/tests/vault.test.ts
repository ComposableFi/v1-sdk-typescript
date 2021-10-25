import { CurrencyAmount, Token } from '..'
import { SupportedToken } from '../entities/supportedToken'
import { Vault } from '..'

describe('#Vault', () => {
  const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
  const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
  const stUSDC = new SupportedToken(
    USDC,
    CurrencyAmount.fromRawAmount(USDC, '20'),
    CurrencyAmount.fromRawAmount(USDC, '30'),
    CurrencyAmount.fromRawAmount(USDC, '100')
  )
  const stDAI = new SupportedToken(
    DAI,
    CurrencyAmount.fromRawAmount(DAI, '20'),
    CurrencyAmount.fromRawAmount(DAI, '50'),
    CurrencyAmount.fromRawAmount(DAI, '35')
  )
  const supportedTokens = {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': stUSDC,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI
  }

  it('Invalid chainID', () => {
    expect(
      () =>
        new Vault(
          1.2, //chainId -> not int
          false, //isPaused
          30, //minTransferDelay
          100, //maxTransferDelay
          30, //minFee
          100, //maxFee
          50, // feeThreshold,
          supportedTokens
        )
    ).toThrow('CHAIN_ID')
  })
  it('Invalid Fee', () => {
    expect(
      () =>
        new Vault(
          1, //chainId
          false, //isPaused
          30, //minTransferDelay
          100, //maxTransferDelay
          0, //minFee == 0
          100, //maxFee
          50, // feeThreshold,
          supportedTokens
        )
    ).toThrow('FEE')
    expect(
      () =>
        new Vault(
          1, //chainId
          false, //isPaused
          30, //minTransferDelay
          100, //maxTransferDelay
          30, //minFee
          0, //maxFee == 0
          50, // feeThreshold,
          supportedTokens
        )
    ).toThrow('FEE')
    expect(
      () =>
        new Vault(
          1, //chainId
          false, //isPaused
          30, //minTransferDelay
          100, //maxTransferDelay
          30, //minFee
          100, //maxFee
          0, // feeThreshold == 0
          supportedTokens
        )
    ).toThrow('FEE')
  })
  it('Invalid transfer threshold', () => {
    expect(
      () =>
        new Vault(
          1, //chainId
          false, //isPaused
          -1, //minTransferDelay == 0
          100, //maxTransferDelay
          30, //minFee
          100, //maxFee
          50, // feeThreshold,
          supportedTokens
        )
    ).toThrow('TRANSFER_THRESHOLD')
    expect(
      () =>
        new Vault(
          1, //chainId
          false, //isPaused
          30, //minTransferDelay
          10, //maxTransferDelay < minTransferDelay
          30, //minFee
          100, //maxFee
          50, // feeThreshold,
          supportedTokens
        )
    ).toThrow('TRANSFER_THRESHOLD')
  })
  it('Valid initialization', () => {
    const vault = new Vault(
      1, //chainId
      false, //isPaused
      30, //minTransferDelay
      50, //maxTransferDelay
      30, //minFee
      100, //maxFee
      50, // feeThreshold,
      supportedTokens
    )
    expect(
      vault.chainId == 1 &&
        vault.isPaused == false &&
        vault.minTransferDelay == 30 &&
        vault.maxTransferDelay == 50 &&
        vault.minFee == 30 &&
        vault.maxFee == 100 &&
        vault.feeThreshold == 50
    ).toBe(true)
    expect(vault.supportedTokens).toEqual(supportedTokens)
  })
})
