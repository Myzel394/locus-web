import {Credentials} from "../types"
import {Relay, relayInit, SimplePool} from "nostr-tools"
import AES from "aes-js"

export default function fetchKeyFromLink(fragment: string): Promise<Credentials> {
	return new Promise(async (resolve, reject) => {
		let relay: Relay

		try {
			const data = JSON.parse(atob(fragment))

			const {
				p: passwordBytes,
				k: nostrPublicKey,
				i: nostrMessageID,
				r: nostrRelay,
				v: initialVectorBytes,
			} = data

			if (
				!Array.isArray(passwordBytes) ||
				!nostrPublicKey ||
				!nostrMessageID ||
				!nostrRelay ||
				!Array.isArray(initialVectorBytes)
			) {
				throw new Error("Link does not contain all required data.")
			}

			relay = relayInit(nostrRelay)

			await relay.connect()

			const subscription = relay.sub([
				{
					ids: [nostrMessageID],
				},
			])

			subscription.on("event", event => {
				console.info("New event received")
				const key = new Uint8Array(passwordBytes)
				const iv = new Uint8Array(initialVectorBytes)

				const messageBytes = JSON.parse(event.content)
				const cipher = new Uint8Array(messageBytes)

				const algorithm = new AES.ModeOfOperation.cbc(key, iv)
				const result = algorithm.decrypt(cipher)
				console.info("Decryption successful!")
				const rawMessage = AES.utils.utf8.fromBytes(result)
				// Remove invalid characters at end
				const message = rawMessage.substring(0, rawMessage.lastIndexOf("}") + 1)

				const rawCredentials = JSON.parse(message) as Credentials
				const credentials = {
					...rawCredentials,
					signPublicKey: rawCredentials.signPublicKey.replaceAll("\\n", "\n"),
					viewPrivateKey: rawCredentials.viewPrivateKey.replaceAll("\\n", "\n"),
				} as Credentials

				console.info("Credentials:", credentials)
				// Validation
				if (credentials.nostrPublicKey !== nostrPublicKey) {
					throw new Error("Public key does not match.")
				}

				resolve(credentials)
			})

			subscription.on("eose", () => {
				subscription.unsub()
				relay?.close?.()
			})
		} catch (e) {
			console.trace(e)
			relay?.close?.()
			reject(e)
			return
		} finally {
		}
	})
}
