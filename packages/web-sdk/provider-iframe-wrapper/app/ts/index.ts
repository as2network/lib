import { provider } from '@as2network/ethereum-browser-sdk';
import { Wallet } from './library/wallet';
import { ErrorHandler } from './library/error-handler';
import { HandshakeHandler } from './library/handshake-handler';
import { HotOstrichChannel } from './library/hot-ostrich-channel';
import { createOnChangeProxy } from './library/proxy';
import { App, AppModel } from './views/app';

function render() {
	const element = React.createElement(App, rootModel)
	ReactDOM.render(element, main)
}

const errorHandler = new ErrorHandler()
const fetch = window.fetch.bind(window)
// const jsonRpcEndpoint = 'https://parity.zoltu.io/' as const
const jsonRpcEndpoint = 'http://127.0.0.1:1235/' as const
const getGasPrice = async (): Promise<bigint> => 2n*10n**9n

let handshakeChannel: provider.HandshakeChannel | undefined = undefined
let hotOstrichChannel: HotOstrichChannel | undefined = undefined
let iframeEventPropagator: ((this: Window, ev: MessageEvent) => any) | undefined = undefined
// let wallet: Wallet | undefined = undefined
const rootModel = createOnChangeProxy<AppModel>(render, {
	errorHandler,
	jsonRpcEndpoint,
	fetch,
	getGasPrice,
	childWindowChanged: childWindow => {
		if (hotOstrichChannel !== undefined) hotOstrichChannel.shutdown()
		if (handshakeChannel !== undefined) handshakeChannel.shutdown()
		if (iframeEventPropagator !== undefined) window.removeEventListener('message', iframeEventPropagator)
		if (childWindow === null) return

		// propogate window events to the iframe window so anyone providing Ethereum access to this page can provide to the iframe as well (e.g., extension)
		iframeEventPropagator = messageEvent => childWindow.postMessage(messageEvent.data, '*')
		window.addEventListener('message', iframeEventPropagator)

		handshakeChannel = new provider.HandshakeChannel(window, childWindow, new HandshakeHandler(errorHandler))
		hotOstrichChannel = new HotOstrichChannel(errorHandler, fetch, window, childWindow, jsonRpcEndpoint, getGasPrice)
	},
	walletChanged: async (wallet: Wallet|undefined) => {
		rootModel.wallet = wallet
		if (hotOstrichChannel === undefined) return
		hotOstrichChannel.updateWallet(rootModel.wallet)
	},

	// // getter/setter so the wallet internals don't get proxied (its contents are immutable)
	// get wallet() { return wallet },
	// set wallet(newWallet) { wallet = newWallet },
	wallet: undefined,
	noProxy: new Set(['wallet']),
})

;(window as any).rootModel = rootModel
const main = document.querySelector('main')
ReactDOM.render(React.createElement(App, { walletAddress: rootModel.wallet === undefined ? undefined : rootModel.wallet.address, ...rootModel}), main)
