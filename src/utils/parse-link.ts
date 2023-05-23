export interface ParseLinkData {
	relay: string
	nostrPublicKey: string
	nostrMessageID: string
	encryptionPassword: Uint8Array
	initialVector: Uint8Array
}

export default function parseLink(fragment: string): ParseLinkData {
	const data = JSON.parse(atob(fragment))

	const password = data.p

	return {
		relay: data.r,
		nostrPublicKey: data.k,
		nostrMessageID: data.i,
		initialVector: Uint8Array.from(data[0]),
		encryptionPassword: Uint8Array.from(password[1]),
	}
}
