import { ethereum, secp256k1 } from '@as2network/ethereum-crypto'
import { Bytes } from '@as2network/ethereum-types';

export class Signer {
	private constructor(
		private readonly privateKey: bigint,
		public readonly publicKey: secp256k1.AffinePoint & secp256k1.JacobianPoint,
		public readonly address: bigint,
	) { }

	public static readonly create = async (privateKey: bigint) => {
		const publicKey = await secp256k1.privateKeyToPublicKey(privateKey)
		const address = await ethereum.publicKeyToAddress(publicKey)
		return new Signer(privateKey, publicKey, address)
	}

	sign = async (message: Bytes): Promise<{ r: bigint, s: bigint, yParity: 'even'|'odd' }> => {
		const signature = await ethereum.signRaw(this.privateKey, message)
		return {
			r: signature.r,
			s: signature.s,
			yParity: signature.recoveryParameter === 0 ? 'even' : 'odd',
		}
	}
}
