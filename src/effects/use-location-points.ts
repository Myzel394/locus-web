import {createEffect, createSignal} from "solid-js"
import * as OpenPGP from "openpgp"
import {SimplePool} from "nostr-tools"
import sortBy from "lodash/sortBy"
import reverse from "lodash/reverse"

export interface UseLocationPointsData {
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
	batteryLevel?: number
	batteryState?: "full" | "charging" | "discharging" | "unknown"
}

export default function useLocationPoints({
	nostrPublicKey,
	pgpPrivateViewKey: rawPGPPrivateViewKey,
	pgpPublicSignKey: rawPGPPublicSignKey,
	relays,
	startDate,
}: UseLocationPointsData): [() => LocationPoint[], () => boolean] {
	let isAddingEvent = false
	const [areEventsDone, setAreEventsDone] = createSignal<boolean>(false)
	const [points, setPoints] = createSignal<LocationPoint[]>([])

	const fixPoints = () => {
		setPoints(reverse(sortBy(points(), ["createdAt"])))
	}

	createEffect(async () => {
		console.info("Reading private key")
		const pgpPrivateViewKey = await OpenPGP.readPrivateKey({armoredKey: rawPGPPrivateViewKey})
		console.info("Reading public key")
		const pgpPublicSignKey = await OpenPGP.readKey({armoredKey: rawPGPPublicSignKey})
		console.info("Done!")

		const pool = new SimplePool()

		const subscription = pool.sub(relays, [
			{
				authors: [nostrPublicKey],
				kinds: [1000],
				since: Math.round(startDate / 1000),
			},
		])

		subscription.on("event", async rawEvent => {
			isAddingEvent = true

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

			setPoints([
				...points(),
				{
					...locationPoint,
					createdAt: new Date(locationPoint.createdAt),
				},
			])

			isAddingEvent = false

			if (areEventsDone()) {
				fixPoints()
			}
		})

		subscription.on("eose", () => {
			setAreEventsDone(true)

			pool.close(relays)

			// This might be called before "event" is done, so in this case we don't want to fix the points yet,
			// this will be done when "event" is done instead.
			if (!isAddingEvent) {
				fixPoints()
			}
		})

		return () => {
			pool.close(relays)
		}
	}, [nostrPublicKey, rawPGPPrivateViewKey, rawPGPPublicSignKey, relays, startDate])

	return [points, areEventsDone]
}
