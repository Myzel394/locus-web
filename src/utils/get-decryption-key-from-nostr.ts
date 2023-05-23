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
	initialVector,
	encryptionPassword,
}: ParseLinkData): Promise<DecryptionCredentials> {
	return new Promise<DecryptionCredentials>(async resolve => {
		const relay = relayInit(relayURL)

		try {
			await relay.connect()

			const subscription = relay.sub([
				{
					ids: [nostrMessageID],
					kinds: [1001],
				},
			])

			subscription.on("event", event => {
				console.info("New event received")
				const cipher = new Uint8Array(JSON.parse(event.content))

				const algorithm = new AES.ModeOfOperation.cbc(encryptionPassword, initialVector)
				const result = algorithm.decrypt(cipher)
				console.info("Decryption successful!")

				const rawMessage = AES.utils.utf8.fromBytes(result)
				const message = JSON.parse(rawMessage)

				resolve({
					encryptionPassword: Uint8Array.from(message["encryptionPassword"]),
					relays: message["relays"],
					nostrPublicKey: message["nostrPublicKey"],
				} as DecryptionCredentials)
			})

			subscription.on("eose", () => {
				subscription.unsub()
				relay?.close?.()
			})
		} finally {
			relay.close()
		}
	})
}
