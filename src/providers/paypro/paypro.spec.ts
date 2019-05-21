import { TestUtils } from '../../test';
import { ProfileProvider } from '../profile/profile';
import { PayproProvider } from './paypro';

describe('PayProProvider', () => {
  let payproProvider: PayproProvider;
  let profileProvider: ProfileProvider;
  const walletFixture = {
    id: {
      credentials: {
        coin: 'btc',
        network: 'livenet'
      },
      isComplete: () => {
        return true;
      },
      fetchPayPro: (_payProUrl, _cb) => {}
    }
  };

  const walletFixture2 = {
    id: {
      credentials: {
        coin: 'btc',
        network: 'testnet'
      },
      isComplete: () => {
        return true;
      },
      fetchPayPro: (_payProUrl, _cb) => {}
    }
  };

  beforeEach(() => {
    const testBed = TestUtils.configureProviderTestingModule();
    payproProvider = testBed.get(PayproProvider);
    profileProvider = testBed.get(ProfileProvider);
  });

  describe('getPayProDetails', () => {
    it('should return paypro details', () => {
      walletFixture.id.fetchPayPro = (_payProUrl, cb) => {
        const paypro = {
          verified: true
        };
        return cb(null, paypro);
      };
      profileProvider.wallet = walletFixture;
      payproProvider
        .getPayProDetails('https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt', 'btc')
        .then(paypro => {
          expect(paypro).toEqual({
            verified: true,
            payProUrl: 'https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt'
          });
        });
    });
    it('should return error if is not verified', () => {
      walletFixture.id.fetchPayPro = (_payProUrl, cb) => {
        const paypro = {
          verified: false
        };
        return cb(null, paypro);
      };
      profileProvider.wallet = walletFixture;
      payproProvider
        .getPayProDetails('https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt', 'btc')
        .catch(err => {
          expect(err).toBeDefined();
        });
    });
    it('should return error if exist', () => {
      walletFixture.id.fetchPayPro = (_payProUrl, cb) => {
        return cb(new Error());
      };
      profileProvider.wallet = walletFixture;
      payproProvider
        .getPayProDetails('https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt', 'btc')
        .catch(err => {
          expect(err).toBeDefined();
        });
    });
    it('should return error if invoice is expired', () => {
      walletFixture.id.fetchPayPro = (_payProUrl, cb) => {
        return cb(new Error('The invoice is no longer receiving payments'));
      };
      profileProvider.wallet = walletFixture;
      payproProvider
        .getPayProDetails('https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt', 'btc')
        .catch(err => {
          expect(err).toBeDefined();
        });
    });
    it('should return error if network does not match', () => {
      walletFixture2.id.fetchPayPro = (_payProUrl, cb) => {
        return cb(
          new Error('The key on the response is not trusted for transactions')
        );
      };
      profileProvider.wallet = walletFixture2;
      payproProvider
        .getPayProDetails('https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt', 'btc')
        .catch(err => {
          expect(err).toBeDefined();
        });
    });
    it('should resolve without error if no wallet available', () => {
      payproProvider
        .getPayProDetails('https://bitpay.com/i/BAikNA9QFMFiEs8HtNnQVt', 'btc')
        .then(result => {
          expect(result).toBe(undefined);
        });
    });
  });
});
