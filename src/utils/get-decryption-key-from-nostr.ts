import {ParseLinkData} from "./parse-link"
import {relayInit} from "nostr-tools"
import AES from "aes-js"

export interface DecryptionCredentials {
	encryptionPassword: Uint8Array
	relays: string[]
	nostrPublicKey: string
}

const getDecryptionKeyFromRelay = async (
	url: string,
	encryptionPassword: Uint8Array,
	nostrMessageID: string,
): Promise<string> => {
	return new Promise<string>(async resolve => {
		console.info("Fetching decryption key from Nostr...")
		const relay = relayInit(url)

		try {
			console.info("Connecting to Nostr...")
			await relay.connect()

			const subscription = relay.sub([
				{
					ids: [nostrMessageID],
					kinds: [1001],
				},
			])

			console.info("Subscribed to Nostr!")
			subscription.on("event", event => {
				try {
					const [rawInitialVector, cipherText] = JSON.parse(event.content) as [
						number[],
						number[],
					]
					console.info("New event received")
					const cipher = new Uint8Array(cipherText)
					const initialVector = new Uint8Array(rawInitialVector)

					console.info("Decrypting. Creating algorithm.")
					const algorithm = new AES.ModeOfOperation.cbc(encryptionPassword, initialVector)
					console.info("Decrypting. Decrypting...")
					const result = algorithm.decrypt(cipher)
					console.info("Decryption successful!")

					const rawMessage = AES.utils.utf8.fromBytes(result)
					// Because of padding there might be some garbage at the end of the message, so we need to trim it.
					const rawMessageNormalized = rawMessage.substring(
						0,
						rawMessage.indexOf("}") + 1,
					)
					const message = JSON.parse(rawMessageNormalized)

					resolve({
						encryptionPassword: Uint8Array.from(message["encryptionPassword"]),
						relays: message["relays"],
						nostrPublicKey: message["nostrPublicKey"],
					} as DecryptionCredentials)
				} catch (error) {
					console.error(error)
				}
			})

			subscription.on("eose", () => {
				console.info("End of stream reached")

				subscription.unsub()
				relay?.close?.()
			})
		} catch (error) {
			console.error(error)
		}
	})
}

const ensureIsArray = <T>(value: T | T[]): T[] => {
	return Array.isArray(value) ? value : [value]
}

export default function getDecryptionKeyFromNostr({
	relays: rawRelays,
	nostrMessageID,
	encryptionPassword,
}: ParseLinkData): Promise<DecryptionCredentials> {
	// For backwards compatibility
	const relays = ensureIsArray(rawRelays)

	return Promise.any(
		relays.map(relay => getDecryptionKeyFromRelay(relay, encryptionPassword, nostrMessageID)),
	)
}
