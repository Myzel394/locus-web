import {createEffect, createSignal} from "solid-js"
import {SimplePool} from "nostr-tools"
import sortBy from "lodash/sortBy"
import reverse from "lodash/reverse"
import {DecryptionCredentials} from "../utils/get-decryption-key-from-nostr"

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
			console.log(rawEvent)
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
