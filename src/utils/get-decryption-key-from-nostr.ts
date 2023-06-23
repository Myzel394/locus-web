import {ParseLinkData} from "./parse-link"
import {relayInit} from "nostr-tools"
import AES from "aes-js"

export interface DecryptionCredentials {
	encryptionPassword: Uint8Array
	relays: string[]
	nostrPublicKey: string
}

export default function getDecryptionKeyFromNostr({
	relay: relayURL,
	nostrPublicKey,
	nostrMessageID,
	encryptionPassword,
}: ParseLinkData): Promise<DecryptionCredentials> {
	return new Promise<DecryptionCredentials>(async resolve => {
		console.info("Fetching decryption key from Nostr...")
		const relay = relayInit(relayURL)

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
					const message = JSON.parse(rawMessage)

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
