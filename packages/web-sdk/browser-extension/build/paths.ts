import * as path from 'path'

const projectRootPath = path.normalize(path.join(__dirname, '..'))
export const tsconfigPath = path.join(projectRootPath, 'tsconfig.json')
export const vendorDirectoryPath = path.join(projectRootPath, 'app', 'vendor')

const nodeModuleDirectoryPath = path.join(projectRootPath, 'node_modules')
export const vendorMapping: { [key: string]: string } = {
	'es-module-shims': path.join(nodeModuleDirectoryPath, 'es-module-shims', 'dist'),
	'webextension-polyfill': path.join(nodeModuleDirectoryPath, 'webextension-polyfill', 'dist'),
	'@as2network/ethereum-browser-sdk': path.join(nodeModuleDirectoryPath, '@as2network', 'ethereum-browser-sdk', 'output-es'),
	'@as2network/ethereum-abi-encoder': path.join(nodeModuleDirectoryPath, '@as2network', 'ethereum-abi-encoder', 'output-es'),
	'@as2network/ethereum-crypto': path.join(nodeModuleDirectoryPath, '@as2network', 'ethereum-crypto', 'output-es'),
	'@as2network/ethereum-fetch-json-rpc': path.join(nodeModuleDirectoryPath, '@as2network', 'ethereum-fetch-json-rpc', 'output-es'),
	'@as2network/ethereum-types': path.join(nodeModuleDirectoryPath, '@as2network', 'ethereum-types', 'output-es'),
	'@as2network/ethereum-ledger': path.join(nodeModuleDirectoryPath, '@as2network', 'ethereum-ledger', 'output-es'),
}
