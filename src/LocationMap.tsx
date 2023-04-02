import {Component, createEffect, JSX} from "solid-js"
import CompassSVG from "./Compass.svg"
import * as L from "leaflet"

export interface LocationMapProps {
	longitude: number
	latitude: number
	accuracy: number
}

const ACCESS_TOKEN = "q6KpniImtOG0cV5C3cLMH60wLmU6lfsNafyiwsElrdxeFXhiaNn7j5s6NTFuMApQ"

const LocationMap: Component<LocationMapProps> = (props: LocationMapProps): JSX.Element => {
	createEffect(() => {
		const map = L.map("location-map").setView([props.latitude, props.longitude], 13)

		L.tileLayer(
			`https://tile.jawg.io/6f677dd5-098d-4198-849b-adcb87377fc8/{z}/{x}/{y}{r}.png?access-token=${ACCESS_TOKEN}`,
			{},
		).addTo(map)

		L.circle([props.latitude, props.longitude], {
			radius: props.accuracy,
			color: "#3454C5",
			fillOpacity: 0.2,
		}).addTo(map)
	})

	return (
		<div class="relative w-full aspect-square">
			<img
				alt=""
				src={CompassSVG}
				class="absolute top-0 left-0 h-full w-full object-contain z-0 pointer-events-none"
			/>
			<div class="absolute w-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-20">
				<div id="location-map" class="bg-locus-background w-full h-full rounded-full" />
			</div>
			{/* Stylistic effects */}
			<div class="absolute w-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-20 pointer-events-none">
				<div
					class="w-full h-full rounded-full"
					style={{
						"box-shadow":
							"inset 10px 10px 24px 20px rgba(0, 0, 0, 0.5), inset 10px 10px 10px 2px rgba(0, 0, 0, 0.5)",
					}}
				/>
			</div>
			<div class="absolute w-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-20 pointer-events-none">
				<div
					class="w-full h-full rounded-full"
					style={{
						background:
							"radial-gradient(50% 50% at 50% 50%, rgba(17, 104, 184, 0) 79.17%, rgba(53, 120, 222, 0.1) 100%)",
					}}
				/>
			</div>
			<div class="absolute w-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-20 pointer-events-none">
				<div
					class="w-full h-full rounded-full"
					style={{
						background:
							"linear-gradient(135.65deg, rgba(255, 255, 255, 0.2) 0%, rgba(51, 85, 119, 0) 41.67%)",
					}}
				/>
			</div>
		</div>
	)
}

export default LocationMap
