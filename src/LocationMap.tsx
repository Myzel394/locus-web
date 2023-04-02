import {Component, createEffect, createSignal, JSX, onMount} from "solid-js"
import CompassNeedlesSVG from "./compass-needles.svg"
import CompassBackgroundSVG from "./compass-background.svg"
import * as L from "leaflet"
import "leaflet-rotate"
import {createEventListener, makeEventListener} from "@solid-primitives/event-listener"
import "leaflet-rotate"
import {useMap} from "./MapProvider"
import {LocationPoint} from "./effects/use-location-points"

const ACCESS_TOKEN = "q6KpniImtOG0cV5C3cLMH60wLmU6lfsNafyiwsElrdxeFXhiaNn7j5s6NTFuMApQ"

const calculateRotationDegree = (movementX: number, movementY: number): number =>
	Math.atan2(movementY, movementX) * (180 / Math.PI)

const LocationMap: Component = (): JSX.Element => {
	const {map, _setMap, setLocationPoint, locationPoint} = useMap()

	let div: HTMLDivElement

	const [isRotating, setIsRotating] = createSignal<boolean>(false)
	const [lastDegree, setLastDegree] = createSignal<number>(0)
	const [startDegree, setStartDegree] = createSignal<number>(0)
	const [additionDegree, setAdditionDegree] = createSignal<number>(0)
	const degree = () => lastDegree() + additionDegree()

	createEventListener(
		document.body,
		["mouseleave", "mouseup"],
		() => {
			setIsRotating(false)
			setLastDegree(degree())
			setAdditionDegree(0)
		},
		{
			passive: true,
		},
	)

	createEventListener(
		document.body,
		"mousemove",
		(event: MouseEvent) => {
			if (!isRotating()) {
				return
			}

			const bounds = div.getBoundingClientRect()

			const halfX = bounds.x + bounds.width / 2
			const halfY = bounds.y + bounds.height / 2

			const diffX = event.clientX - halfX
			const diffY = event.clientY - halfY

			setAdditionDegree(calculateRotationDegree(diffX, diffY) - startDegree())
		},
		{
			passive: true,
		},
	)

	onMount(() => {
		_setMap(
			L.map("location-map", {
				rotate: true,
			}).setView(
				[locationPoint()!.latitude as number, locationPoint()!.longitude as number],
				16,
			),
		)

		L.tileLayer(
			`https://tile.jawg.io/6f677dd5-098d-4198-849b-adcb87377fc8/{z}/{x}/{y}{r}.png?access-token=${ACCESS_TOKEN}`,
			{},
		).addTo(map())
	})

	createEffect(() => {
		map().setBearing(degree())
	})

	return (
		<div class="relative h-full aspect-square overflow-hidden select-none">
			<img
				alt=""
				src={CompassBackgroundSVG}
				class="absolute top-0 left-0 h-full aspect-square object-contain z-0 pointer-events-none"
			/>
			<div class="absolute top-0 left-0 h-full aspect-square object-contain z-0 p-1 pointer-events-none">
				<img
					alt=""
					src={CompassNeedlesSVG}
					class="w-full h-full"
					style={{
						transform: `rotate(${degree()}deg)`,
					}}
				/>
			</div>
			<div
				ref={div}
				onMouseDown={event => {
					setIsRotating(true)

					const bounds = div.getBoundingClientRect()

					const halfX = bounds.x + bounds.width / 2
					const halfY = bounds.y + bounds.height / 2

					const diffX = event.clientX - halfX
					const diffY = event.clientY - halfY

					setStartDegree(calculateRotationDegree(diffX, diffY))
				}}
				class="absolute h-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-12 rounded-full"
			>
				<div
					onmousedown={(event: MouseEvent) => {
						event.stopPropagation()
						event.preventDefault()
					}}
					id="location-map"
					class="bg-locus-background w-full h-full rounded-full"
				/>
			</div>
			{/* Stylistic effects */}
			<div class="absolute h-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-12 rounded-full pointer-events-none">
				<div
					class="w-full h-full rounded-full"
					style={{
						"box-shadow":
							"inset 10px 10px 24px 20px rgba(0, 0, 0, 0.5), inset 10px 10px 10px 2px rgba(0, 0, 0, 0.5)",
					}}
				/>
			</div>
			<div class="absolute h-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-12 rounded-full pointer-events-none">
				<div
					class="w-full h-full rounded-full"
					style={{
						background:
							"radial-gradient(50% 50% at 50% 50%, rgba(17, 104, 184, 0) 79.17%, rgba(53, 120, 222, 0.1) 100%)",
					}}
				/>
			</div>
			<div class="absolute h-full aspect-square top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 p-12 rounded-full pointer-events-none">
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
