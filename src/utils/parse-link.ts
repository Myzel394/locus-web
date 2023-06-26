export interface ParseLinkData {
	relays: string[]
	nostrPublicKey: string
	nostrMessageID: string
	encryptionPassword: Uint8Array
}

export default function parseLink(fragment: string): ParseLinkData {
	const data = JSON.parse(atob(fragment))

	return {
		relays: data.r,
		nostrPublicKey: data.k,
		nostrMessageID: data.i,
		encryptionPassword: Uint8Array.from(data.p),
	}
}
