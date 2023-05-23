import {createEffect, createSignal} from "solid-js"
import {SimplePool} from "nostr-tools"
import sortBy from "lodash/sortBy"
import reverse from "lodash/reverse"
import {DecryptionCredentials} from "../utils/get-decryption-key-from-nostr"
import AES from "aes-js"

export type UseLocationPointsData = DecryptionCredentials & {
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
	encryptionPassword,
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

			console.info("New event received")
			const publicData = JSON.parse(rawEvent.content)
			const initialVector = Uint8Array.from(publicData[0])
			const cipherText = new Uint8Array(publicData[1])

			const algorithm = new AES.ModeOfOperation.cbc(encryptionPassword, initialVector)
			const result = algorithm.decrypt(cipherText)
			console.info("Decryption successful!")

			const rawMessage = AES.utils.utf8.fromBytes(result)
			// Because of padding there might be some garbage at the end of the message, so we need to trim it.
			const lastBraceIndex = rawMessage.lastIndexOf("}")
			const message = JSON.parse(rawMessage.substring(0, lastBraceIndex + 1)) as LocationPoint

			setPoints([
				...points(),
				{
					...message,
					createdAt: new Date(message.createdAt),
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
	}, [nostrPublicKey, relays, startDate])

	return [points, areEventsDone]
}
