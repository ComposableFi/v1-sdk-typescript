import { CurrencyAmount, Token } from '..'
import { SupportedToken } from '../entities/supportedToken'
import { Vault } from '..'
import { Direction } from '..'
import JSBI from 'jsbi'
import { Transfer } from '..'

describe('transfer', () => {
  const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
  const DAI = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
  const DAI2 = new Token(2, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
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
  const supportedTokensFrom = {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': stUSDC,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI
  }
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
  const stDAI2 = new SupportedToken(
    DAI2,
    CurrencyAmount.fromRawAmount(DAI, '20'),
    CurrencyAmount.fromRawAmount(DAI, '30'),
    CurrencyAmount.fromRawAmount(DAI, '100')
  )
  const supportedTokensTo = { '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI2 }
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
  const direction: Direction = new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: DAI2 })
  it('Invalid amount - breaks threshold', () => {
    let transfer: Transfer<Token> = new Transfer(
      direction,
      CurrencyAmount.fromRawAmount(DAI, '10'),
      '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
      30
    )
    expect(() => transfer.verifyTransfer()).toThrow('AMOUNT_THRESHOLD')
    transfer = new Transfer(
      direction,
      CurrencyAmount.fromRawAmount(DAI, '60'),
      '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
      30
    )
    expect(() => transfer.verifyTransfer()).toThrow('AMOUNT_THRESHOLD')
  })
  it('Invalid liquidity', () => {
    let transfer: Transfer<Token> = new Transfer(
      direction,
      CurrencyAmount.fromRawAmount(DAI, '40'),
      '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
      10
    )
    expect(() => transfer.verifyTransfer()).toThrow('LIQUIDITY')
    transfer = new Transfer(
      direction,
      CurrencyAmount.fromRawAmount(DAI, '30'),
      '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
      9
    )
    expect(() => transfer.verifyTransfer()).toThrow('DEPOSIT_TIME_THRESHOLD')
    transfer = new Transfer(
      direction,
      CurrencyAmount.fromRawAmount(DAI, '30'),
      '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
      150
    )
    expect(() => transfer.verifyTransfer()).toThrow('DEPOSIT_TIME_THRESHOLD')
  })

  describe('#fees', () => {
    it('Valid fee', () => {
      const stDAI2 = new SupportedToken(
        DAI2,
        CurrencyAmount.fromRawAmount(DAI, '20' + '0'.repeat(DAI2.decimals)),
        CurrencyAmount.fromRawAmount(DAI, '30' + '0'.repeat(DAI2.decimals)),
        CurrencyAmount.fromRawAmount(DAI, '50' + '0'.repeat(DAI2.decimals))
      )
      const supportedTokensTo = { '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI2 }
      const vaultTo = new Vault(
        137,
        false,
        JSBI.BigInt('10'),
        JSBI.BigInt('100'),
        JSBI.BigInt('25'),
        JSBI.BigInt('400'),
        JSBI.BigInt('50'),
        supportedTokensTo
      )

      const direction: Direction = new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: DAI2 })

      const transfer: Transfer<Token> = new Transfer(
        direction,
        CurrencyAmount.fromRawAmount(DAI, '50' + '0'.repeat(DAI2.decimals)),
        '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
        30
      )
      expect(transfer.calculateFee().equalTo(2))
    })

    it('Zero fee when availableLiquidity is zero', () => {
      const stDAI2 = new SupportedToken(
        DAI2,
        CurrencyAmount.fromRawAmount(DAI, '20' + '0'.repeat(DAI2.decimals)),
        CurrencyAmount.fromRawAmount(DAI, '30' + '0'.repeat(DAI2.decimals)),
        CurrencyAmount.fromRawAmount(DAI, '0')
      )
      const supportedTokensTo = { '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI2 }
      const vaultTo = new Vault(
        2,
        false,
        JSBI.BigInt('10'),
        JSBI.BigInt('100'),
        JSBI.BigInt('25'),
        JSBI.BigInt('400'),
        JSBI.BigInt('50'),
        supportedTokensTo
      )

      const direction: Direction = new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: DAI2 })

      const transfer: Transfer<Token> = new Transfer(
        direction,
        CurrencyAmount.fromRawAmount(DAI, '50' + '0'.repeat(DAI2.decimals)),
        '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
        30
      )
      expect(transfer.calculateFee().equalTo(0))
    })

    it('Fee when amount/available liquidity > feeThreshold', () => {
      // 50/50*100 > 60
      //amount: 50
      //availLiq: 50
      //threshold: 60
      //maxFee: 400
      const stDAI2 = new SupportedToken(
        DAI2,
        CurrencyAmount.fromRawAmount(DAI, '20' + '0'.repeat(DAI2.decimals)),
        CurrencyAmount.fromRawAmount(DAI, '30' + '0'.repeat(DAI2.decimals)),
        CurrencyAmount.fromRawAmount(DAI, '50' + '0'.repeat(DAI2.decimals))
      )
      const supportedTokensTo = { '0x6B175474E89094C44Da98b954EedeAC495271d0F': stDAI2 }
      const vaultTo = new Vault(
        2,
        false,
        JSBI.BigInt('10'),
        JSBI.BigInt('100'),
        JSBI.BigInt('25'),
        JSBI.BigInt('400'),
        JSBI.BigInt('60'), //feeThreshold
        supportedTokensTo
      )

      const direction: Direction = new Direction({ vault: vaultFrom, token: DAI }, { vault: vaultTo, token: DAI2 })

      const transfer: Transfer<Token> = new Transfer(
        direction,
        CurrencyAmount.fromRawAmount(DAI, '40' + '0'.repeat(DAI2.decimals)),
        '0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94',
        30
      )
      expect(transfer.calculateFee().toSignificant()).toEqual('1.6')
    })
  })
})
