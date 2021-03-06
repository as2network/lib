import { client } from '@as2network/ethereum-browser-sdk';

export type ArrayType<T extends any[]> = T extends Array<infer U> ? U : never
export type ProviderAnnouncement = Parameters<client.HandshakeHandlers['onProviderAnnounced']>[0]
