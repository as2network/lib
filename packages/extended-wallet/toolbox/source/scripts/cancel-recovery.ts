import { getWallet } from './_globals';

async function main() {
	const wallet = await getWallet()
	await wallet.cancelRecovery()
}

if (require.main === module) {
	// necessary so @peculiar/webcrypto looks like browser WebCrypto, which @as2network/ethereum-crypto needs
	import('@peculiar/webcrypto')
		.then(webcrypto => (globalThis as any).crypto = new webcrypto.Crypto())
		.then(main)
		.catch(error => {
			console.error(error)
			process.exit(1)
		})
}
