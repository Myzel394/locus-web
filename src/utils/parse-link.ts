export interface ParseLinkData {
	relay: string
	nostrPublicKey: string
	nostrMessageID: string
	encryptionPassword: Uint8Array
}

export default function parseLink(fragment: string): ParseLinkData {
	const data = JSON.parse(atob(fragment))

	return {
		relay: data.r,
		nostrPublicKey: data.k,
		nostrMessageID: data.i,
		encryptionPassword: Uint8Array.from(data.p),
	}
}
