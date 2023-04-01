import {SimplePool} from "nostr-tools"
import * as OpenPGP from "openpgp"

export interface FetchLocationPointsData {
	nostrPublicKey: string
	pgpPrivateViewKey: string
	pgpPublicSignKey: string
	relays: string[]
	startDate: Date
}

export interface LocationPoint {
	createdAt: Date
	latitude: number
	longitude: number
	accuracy: number
	altitude?: number
	speed?: number
	speedAccuracy?: number
	heading?: number
	headingAccuracy?: number
}

export default function fetchLocationPoints({
	nostrPublicKey,
	pgpPrivateViewKey: rawPGPPrivateViewKey,
	pgpPublicSignKey: rawPGPPublicSignKey,
	relays,
	startDate,
}: FetchLocationPointsData): Promise<LocationPoint[]> {
	return new Promise(async resolve => {
		const pgpPrivateViewKey = await OpenPGP.readPrivateKey({armoredKey: rawPGPPrivateViewKey})
		const pgpPublicSignKey = await OpenPGP.readKey({armoredKey: rawPGPPublicSignKey})

		const _events = []
		const pool = new SimplePool()

		const subscription = pool.sub(relays, [
			{
				authors: [nostrPublicKey],
				kinds: [1000],
				since: Math.round(startDate / 1000),
			},
		])

		subscription.on("event", async rawEvent => {
			const {data: decryptedData} = await OpenPGP.decrypt({
				message: await OpenPGP.readMessage({armoredMessage: rawEvent.content}),
				decryptionKeys: pgpPrivateViewKey,
			})

			if (typeof decryptedData !== "string") {
				return
			}

			const message = JSON.parse(decryptedData)

			const signatureResult = await OpenPGP.verify({
				message: await OpenPGP.createMessage({
					text: message.message,
				}),
				signature: await OpenPGP.readSignature({
					armoredSignature: message.signature,
				}),
				verificationKeys: pgpPublicSignKey,
			})

			if (!signatureResult.signatures[0].verified) {
				return
			}

			const locationPoint = JSON.parse(message.message)

			console.log("event", locationPoint)
			_events.push({
				...locationPoint,
				createdAt: new Date(locationPoint.createdAt),
			})
		})

		// This might be called before "event" is done, we need to wait for it to finish
		subscription.on("eose", () => {
			console.log("eose", _events)
			resolve(_events)

			pool.close(relays)
		})
	})
}
